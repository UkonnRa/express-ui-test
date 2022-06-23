import { inject, singleton } from "tsyringe";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import {
  AdditionalQuery,
  AuthUser,
  checkCreate,
  CommandInput,
  RoleValue,
  WriteService,
} from "../shared";
import { UserEntity, UserService } from "../user";
import { GroupEntity, GroupService } from "../group";
import { AlreadyArchivedError, NoPermissionError } from "../error";
import { filterAsync } from "../utils";
import JournalEntity, { JOURNAL_TYPE } from "./journal.entity";
import JournalCommand from "./journal.command";
import AccessItemInput from "./access-item.input";
import CreateJournalCommand from "./create-journal.command";
import UpdateJournalCommand from "./update-journal.command";
import DeleteJournalCommand from "./delete-journal.command";
import AccessItemValue from "./access-item.value";
import AccessItemTypeValue from "./access-item-type.value";
import AccessItemAccessibleTypeValue from "./access-item-accessible-type.value";

export const JOURNAL_READ_SCOPE =
  "urn:alices-wonderland:white-rabbit:journals:read";
export const JOURNAL_WRITE_SCOPE =
  "urn:alices-wonderland:white-rabbit:journals:write";

@singleton()
export default class JournalService extends WriteService<
  JournalEntity,
  JournalCommand
> {
  constructor(
    @inject(MikroORM) readonly orm: MikroORM,
    @inject(UserService) private readonly userService: UserService,
    @inject(GroupService) private readonly groupService: GroupService
  ) {
    super(
      orm,
      JOURNAL_TYPE,
      JournalEntity,
      JOURNAL_READ_SCOPE,
      JOURNAL_WRITE_SCOPE,
      ["CreateJournalCommand"]
    );
  }

  async loadUserGroup(
    authUser: AuthUser,
    accessItems: AccessItemInput[],
    em: EntityManager
  ): Promise<Array<UserEntity | GroupEntity>> {
    const users = await em.find(UserEntity, {
      id: accessItems
        .filter(({ type }) => type === AccessItemTypeValue.USER)
        .map(({ id }) => id),
    });
    const groups = await em.find(
      GroupEntity,
      {
        id: accessItems
          .filter(({ type }) => type === AccessItemTypeValue.GROUP)
          .map(({ id }) => id),
      },
      {
        populate: ["admins", "members"],
      }
    );
    return [
      ...(await filterAsync(users, async (item) =>
        this.userService.isReadable(item, authUser)
      )),
      ...(await filterAsync(groups, async (item) =>
        this.groupService.isReadable(item, authUser)
      )),
    ];
  }

  private async createJournal(
    authUser: AuthUser,
    command: CreateJournalCommand,
    em: EntityManager
  ): Promise<JournalEntity> {
    await checkCreate(
      this.type,
      this.entityName,
      authUser,
      this.writeScope,
      {
        name: command.name,
      },
      em
    );

    const admins = await this.loadUserGroup(authUser, command.admins, em);
    const members = await this.loadUserGroup(authUser, command.members, em);
    const entity = new JournalEntity(
      command.name,
      command.description,
      command.tags,
      command.unit
    );
    entity.setAccessItems(admins, AccessItemAccessibleTypeValue.ADMIN);
    entity.setAccessItems(members, AccessItemAccessibleTypeValue.MEMBER);
    em.persist(entity);
    return entity;
  }

  private async updateJourney(
    authUser: AuthUser,
    command: UpdateJournalCommand,
    em: EntityManager
  ): Promise<JournalEntity> {
    const entity = await this.getWriteableEntity(
      authUser,
      command.targetId,
      em
    );

    if (
      command.name == null &&
      command.description == null &&
      command.tags == null &&
      command.unit == null &&
      command.admins == null &&
      command.members == null
    ) {
      return entity;
    }

    if (command.name != null) {
      entity.name = command.name;
    }

    if (command.description != null) {
      entity.description = command.description;
    }

    if (command.tags != null) {
      entity.tags = new Set(command.tags);
    }

    if (command.unit != null) {
      entity.unit = command.unit;
    }

    if (command.admins != null) {
      const admins = await this.loadUserGroup(authUser, command.admins, em);
      entity.setAccessItems(admins, AccessItemAccessibleTypeValue.ADMIN);
    }

    if (command.members != null) {
      const members = await this.loadUserGroup(authUser, command.members, em);
      entity.setAccessItems(members, AccessItemAccessibleTypeValue.MEMBER);
    }

    em.persist(entity);
    return entity;
  }

  private async deleteJournal(
    authUser: AuthUser,
    command: DeleteJournalCommand,
    em: EntityManager
  ): Promise<void> {
    const entity = await this.getWriteableEntity(
      authUser,
      command.targetId,
      em
    );

    await em.removeAndFlush(entity);
  }

  async handle(
    { authUser, command }: CommandInput<JournalCommand>,
    em?: EntityManager
  ): Promise<JournalEntity | null> {
    const emInst = em ?? this.orm.em.fork();
    switch (command.type) {
      case "CreateJournalCommand":
        return this.createJournal(authUser, command, emInst);
      case "UpdateJournalCommand":
        return this.updateJourney(authUser, command, emInst);
      case "DeleteJournalCommand":
        return this.deleteJournal(authUser, command, emInst).then(() => null);
    }
  }

  async isReadable(
    entity: JournalEntity,
    authUser: AuthUser
  ): Promise<boolean> {
    if (!(await super.isReadable(entity, authUser))) {
      return false;
    }

    if (!entity.accessItems.isInitialized()) {
      await entity.accessItems.init();
    }

    const accessItemsContains = await Promise.all(
      entity.accessItems
        .getItems()
        .map(async (item) => item.contains(authUser.user?.id ?? ""))
    );

    return !accessItemsContains.every((contains) => !contains);
  }

  async checkWriteable(
    entity: JournalEntity,
    authUser: AuthUser
  ): Promise<void> {
    await super.checkWriteable(entity, authUser);

    const user = authUser.user;

    if (user == null) {
      throw new NoPermissionError(this.type, "WRITE");
    }

    if (user.role !== RoleValue.USER) {
      return;
    }

    if (entity.archived) {
      throw new AlreadyArchivedError(this.type, entity.id);
    }

    if (!entity.accessItems.isInitialized()) {
      await entity.accessItems.init();
    }

    const adminContains = await Promise.all(
      entity.admins.map(async (item) => item.contains(user.id))
    );

    if (adminContains.every((isAdmin) => !isAdmin)) {
      throw new NoPermissionError(this.type, "WRITE");
    }
  }

  async handleAdditionalQuery(
    authUser: AuthUser,
    entities: JournalEntity[],
    query: AdditionalQuery
  ): Promise<JournalEntity[]> {
    const someContains = async (
      accessItems: AccessItemValue[],
      userId: string
    ): Promise<boolean> => {
      for (const item of accessItems) {
        if (await item.contains(userId)) {
          return true;
        }
      }
      return false;
    };
    if (query.type === "ContainingUserQuery") {
      return filterAsync(entities, async (value) => {
        if (query.field === AccessItemAccessibleTypeValue.ADMIN) {
          return someContains(value.admins, query.user);
        } else if (query.field === AccessItemAccessibleTypeValue.MEMBER) {
          return someContains(value.members, query.user);
        } else {
          return (
            (await someContains(value.admins, query.user)) ||
            someContains(value.members, query.user)
          );
        }
      });
    } else {
      return super.handleAdditionalQuery(authUser, entities, query);
    }
  }
}
