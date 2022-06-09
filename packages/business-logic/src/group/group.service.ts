import { AuthUser, CommandInput, Service } from "../shared";
import GroupEntity, { GROUP_TYPE } from "./group.entity";
import GroupCommand from "./group.command";
import { singleton } from "tsyringe";
import { EntityDTO, EntityManager, MikroORM } from "@mikro-orm/core";
import { RoleValue, UserEntity, UserService } from "../user";
import CreateGroupCommand from "./create-group.command";
import { AlreadyExistError, NoPermissionError, NotFoundError } from "../error";
import { filterAsync } from "../utils";
import UpdateGroupCommand from "./update-group.command";
import DeleteGroupCommand from "./delete-group.command";

export const GROUP_READ_SCOPE =
  "urn:alices-wonderland:white-rabbit:groups:read";
export const GROUP_WRITE_SCOPE =
  "urn:alices-wonderland:white-rabbit:groups:write";

@singleton()
export default class GroupService extends Service<GroupEntity, GroupCommand> {
  constructor(orm: MikroORM, private readonly userService: UserService) {
    super(orm, GROUP_READ_SCOPE, GROUP_WRITE_SCOPE, GroupEntity, GROUP_TYPE);
  }

  private async createGroup(
    authUser: AuthUser,
    command: CreateGroupCommand,
    em: EntityManager
  ): Promise<GroupEntity> {
    if (
      authUser == null ||
      !authUser.scopes.includes(this.writeScope) ||
      authUser.user == null
    ) {
      throw new NoPermissionError(this.type, "WRITE");
    }

    if (authUser.user?.deletedAt != null) {
      throw new NoPermissionError(this.type, "WRITE");
    }

    if ((await em.findOne(this.entityType, { name: command.name })) != null) {
      throw new AlreadyExistError(this.type, "name", command.name);
    }

    const admins = await em.find(UserEntity, {
      id: { $in: [...command.admins, authUser.user.id] },
    });
    const members = await em.find(UserEntity, { id: { $in: command.members } });
    const entity = new GroupEntity(command.name, command.description);
    entity.setAdmins(
      await filterAsync(admins, async (e) =>
        this.userService.isReadable(e, authUser)
      )
    );
    entity.setMembers(
      await filterAsync(members, async (e) =>
        this.userService.isReadable(e, authUser)
      )
    );
    em.persist(entity);
    return entity;
  }

  private async updateGroup(
    authUser: AuthUser,
    command: UpdateGroupCommand,
    em: EntityManager
  ): Promise<GroupEntity> {
    const entity = await em.findOneOrFail(
      this.entityType,
      { id: command.targetId },
      { failHandler: () => new NotFoundError(this.type, command.targetId) }
    );
    if (!(await this.isWriteable(entity, authUser))) {
      throw new NoPermissionError(this.type, "WRITE");
    }

    if (
      command.name == null &&
      command.description == null &&
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

    if (command.admins != null) {
      const admins = await em.find(UserEntity, { id: { $in: command.admins } });
      entity.setAdmins(
        await filterAsync(admins, async (e) =>
          this.userService.isReadable(e, authUser)
        )
      );
    }

    if (command.members != null) {
      const members = await em.find(UserEntity, {
        id: { $in: command.members },
      });
      entity.setMembers(
        await filterAsync(members, async (e) =>
          this.userService.isReadable(e, authUser)
        )
      );
    }

    em.persist(entity);
    return entity;
  }

  private async deleteGroup(
    authUser: AuthUser,
    command: DeleteGroupCommand,
    em: EntityManager
  ): Promise<void> {
    const entity = await em.findOneOrFail(
      this.entityType,
      { id: command.targetId },
      { failHandler: () => new NotFoundError(this.type, command.targetId) }
    );
    if (!(await this.isWriteable(entity, authUser))) {
      throw new NoPermissionError(this.type, "WRITE");
    }

    entity.deletedAt = new Date();
    entity.name = entity.name + new Date().toUTCString();
    em.persist(entity);
  }

  async handle(
    { command, authUser }: CommandInput<GroupCommand>,
    em?: EntityManager
  ): Promise<EntityDTO<GroupEntity> | null> {
    const emInst = em ?? this.orm.em.fork();
    switch (command.type) {
      case "CreateGroupCommand":
        return this.createGroup(authUser, command, emInst).then((e) =>
          e.toObject()
        );
      case "UpdateGroupCommand":
        return this.updateGroup(authUser, command, emInst).then((e) =>
          e.toObject()
        );
      case "DeleteGroupCommand":
        return this.deleteGroup(authUser, command, emInst).then(() => null);
    }
  }

  async handleAll(): Promise<Array<EntityDTO<GroupEntity> | null>> {
    return [];
  }

  async isReadable(entity: GroupEntity, authUser?: AuthUser): Promise<boolean> {
    if (!this.doGeneralPermissionCheck(this.readScope, entity, authUser)) {
      return false;
    }

    if ((authUser?.user?.role ?? RoleValue.USER) > RoleValue.USER) {
      return true;
    }

    if (!entity.admins.isInitialized()) {
      await entity.admins.init();
    }

    if (!entity.members.isInitialized()) {
      await entity.members.init();
    }

    return (
      authUser?.user != null &&
      (entity.admins.contains(authUser.user) ||
        entity.members.contains(authUser.user))
    );
  }

  async isWriteable(
    entity: GroupEntity,
    authUser?: AuthUser
  ): Promise<boolean> {
    if (!this.doGeneralPermissionCheck(this.writeScope, entity, authUser)) {
      return false;
    }

    if ((authUser?.user?.role ?? RoleValue.USER) > RoleValue.USER) {
      return true;
    }

    if (!entity.admins.isInitialized()) {
      await entity.admins.init();
    }

    return authUser?.user != null && entity.admins.contains(authUser.user);
  }
}
