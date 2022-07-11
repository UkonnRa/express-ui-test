import { inject, singleton } from "tsyringe";
import {
  Collection,
  EntityManager,
  MikroORM,
  ObjectQuery,
} from "@mikro-orm/core";
import {
  AdditionalQuery,
  CONTAINING_USER_OPERATOR,
  CreateGroupCommand,
  DeleteGroupCommand,
  FULL_TEXT_OPERATOR,
  GROUP_READ_SCOPE,
  GROUP_WRITE_SCOPE,
  GroupCommand,
  GroupQuery,
  RoleValue,
  UpdateGroupCommand,
} from "@white-rabbit/types";
import _ from "lodash";
import { AuthUser, CommandInput, checkCreate, WriteService } from "../shared";
import { UserEntity, UserService } from "../user";
import { filterAsync, fullTextSearch } from "../utils";
import { NoPermissionError } from "../error";
import GroupEntity, { GROUP_TYPE } from "./group.entity";

@singleton()
export default class GroupService extends WriteService<
  GroupEntity,
  GroupCommand,
  GroupQuery
> {
  constructor(
    @inject(MikroORM) readonly orm: MikroORM,
    @inject(UserService) private readonly userService: UserService
  ) {
    super(orm, GROUP_TYPE, GroupEntity, GROUP_READ_SCOPE, GROUP_WRITE_SCOPE, [
      "CreateGroupCommand",
    ]);
  }

  private async createGroup(
    authUser: AuthUser,
    command: CreateGroupCommand,
    em: EntityManager
  ): Promise<GroupEntity> {
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

    const admins = await em.find(UserEntity, {
      id: {
        $in:
          authUser.user != null
            ? [...command.admins, authUser.user.id]
            : command.admins,
      },
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
    const entity = await this.getWriteableEntity(
      authUser,
      command.targetId,
      em
    );

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
    const entity = await this.getWriteableEntity(
      authUser,
      command.targetId,
      em
    );

    await em.removeAndFlush(entity);
  }

  override async doHandle(
    { command, authUser }: CommandInput<GroupCommand>,
    em: EntityManager
  ): Promise<GroupEntity | null> {
    switch (command.type) {
      case "CreateGroupCommand":
        return this.createGroup(authUser, command, em);
      case "UpdateGroupCommand":
        return this.updateGroup(authUser, command, em);
      case "DeleteGroupCommand":
        return this.deleteGroup(authUser, command, em).then(() => null);
    }
  }

  async isReadable(entity: GroupEntity, { user }: AuthUser): Promise<boolean> {
    if ((user?.role ?? RoleValue.USER) !== RoleValue.USER) {
      return true;
    }

    if ((user?.role ?? RoleValue.USER) !== RoleValue.USER) {
      return true;
    }

    if (!entity.admins.isInitialized()) {
      await entity.admins.init();
    }

    if (!entity.members.isInitialized()) {
      await entity.members.init();
    }

    return (
      user != null &&
      (entity.admins.contains(user) || entity.members.contains(user))
    );
  }

  async checkWriteable(entity: GroupEntity, authUser: AuthUser): Promise<void> {
    await super.checkWriteable(entity, authUser);

    if (!entity.admins.isInitialized()) {
      await entity.admins.init();
    }

    if (authUser.user == null || entity.admins.contains(authUser.user)) {
      throw new NoPermissionError(this.type, "WRITE");
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async handleAdditionalQuery(
    authUser: AuthUser,
    entities: GroupEntity[],
    query: AdditionalQuery
  ): Promise<GroupEntity[]> {
    if (query.type === "ContainingUserQuery") {
      return entities.filter((entity) => {
        for (const field of query.fields) {
          if (field in GroupEntity) {
            const value = entity[field as keyof GroupEntity];
            if (
              value instanceof Collection &&
              value.getItems().some((item) => item.id === query.user)
            ) {
              return true;
            }
          }
        }
        return false;
      });
    } else if (query.type === "FullTextQuery") {
      return filterAsync(entities, async (entity) =>
        fullTextSearch(entity, query)
      );
    } else {
      return super.handleAdditionalQuery(authUser, entities, query);
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  override doGetQueries(
    query: GroupQuery
  ): [AdditionalQuery[], ObjectQuery<GroupEntity>] {
    const additionalQuery: AdditionalQuery[] = [];
    const objectQuery: ObjectQuery<GroupEntity> = {};

    for (const [key, value] of Object.entries(query)) {
      if (key === FULL_TEXT_OPERATOR && !_.isEmpty(value)) {
        additionalQuery.push({
          type: "FullTextQuery",
          value,
          fields: ["name", "description"],
        });
      } else if (key === CONTAINING_USER_OPERATOR && !_.isEmpty(value)) {
        additionalQuery.push({
          type: "ContainingUserQuery",
          user: value,
          fields: ["admins", "members"],
        });
      } else if (key === "id" && !_.isEmpty(value)) {
        objectQuery.id = value;
      } else if (key === "name" && !_.isEmpty(value)) {
        if (typeof value === "string" && !_.isEmpty(value)) {
          objectQuery.name = value;
        } else if (
          FULL_TEXT_OPERATOR in value &&
          !_.isEmpty(value[FULL_TEXT_OPERATOR])
        ) {
          additionalQuery.push({
            type: "FullTextQuery",
            value: value[FULL_TEXT_OPERATOR],
            fields: ["name"],
          });
        }
      } else if (key === "description" && !_.isEmpty(value)) {
        additionalQuery.push({
          type: "FullTextQuery",
          value,
          fields: ["description"],
        });
      } else if (key === "admins" && !_.isEmpty(value)) {
        objectQuery.admins = value;
      } else if (key === "members" && !_.isEmpty(value)) {
        objectQuery.members = value;
      }
    }

    return [additionalQuery, objectQuery];
  }
}
