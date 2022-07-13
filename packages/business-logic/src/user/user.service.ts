import { EntityManager, MikroORM, ObjectQuery } from "@mikro-orm/core";
import { inject, singleton } from "tsyringe";
import {
  CreateUserCommand,
  RoleValue,
  UpdateUserCommand,
  compareRole,
  UserCommand,
  UserQuery,
  DeleteUserCommand,
  AdditionalQuery,
  USER_READ_SCOPE,
  USER_WRITE_SCOPE,
  FULL_TEXT_OPERATOR,
} from "@white-rabbit/types";
import { isEmpty } from "lodash";
import { AuthUser, checkCreate, WriteService } from "../shared";
import CommandInput from "../shared/command.input";
import { NoPermissionError } from "../error";
import InvalidCommandError from "../error/invalid-command.error";
import { filterAsync, fullTextSearch } from "../utils";
import UserEntity, { USER_TYPE } from "./user.entity";

@singleton()
export default class UserService extends WriteService<
  UserEntity,
  UserCommand,
  UserQuery
> {
  constructor(@inject(MikroORM) readonly orm: MikroORM) {
    super(orm, USER_TYPE, UserEntity, USER_READ_SCOPE, USER_WRITE_SCOPE, [
      "CreateUserCommand",
    ]);
  }

  private async createUser(
    authUser: AuthUser,
    command: CreateUserCommand,
    em: EntityManager
  ): Promise<UserEntity> {
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

    if (
      authUser.user == null &&
      command.role != null &&
      command.role !== RoleValue.USER
    ) {
      throw new InvalidCommandError();
    }

    const entity = new UserEntity(
      command.name,
      command.role ?? RoleValue.USER,
      authUser.user == null
        ? { [authUser.authId.provider]: authUser.authId.value }
        : command.authIds ?? {}
    );

    em.persist(entity);
    return entity;
  }

  private async updateUser(
    authUser: AuthUser,
    command: UpdateUserCommand,
    em: EntityManager
  ): Promise<UserEntity> {
    const entity = await this.getWriteableEntity(
      authUser,
      command.targetId,
      em
    );

    if (
      command.name == null &&
      command.role == null &&
      command.authIds == null
    ) {
      return entity;
    }

    if (command.role != null) {
      // If the role of authUser is smaller than either of the command or the existing entity, throw error
      if (
        authUser.user?.role == null ||
        compareRole(authUser.user.role, command.role) <= 0 ||
        compareRole(authUser.user.role, entity.role) <= 0
      ) {
        throw new NoPermissionError(this.type, "WRITE");
      }
      entity.role = command.role;
    }

    if (command.name != null) {
      entity.name = command.name;
    }

    if (command.authIds != null) {
      // Users cannot modify authIds themselves
      if (
        authUser.user?.role == null ||
        authUser.user.role === RoleValue.USER
      ) {
        throw new NoPermissionError(this.type, "WRITE");
      }
      entity.authIds = command.authIds;
    }

    em.persist(entity);
    return entity;
  }

  private async deleteUser(
    authUser: AuthUser,
    command: DeleteUserCommand,
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
    { command, authUser }: CommandInput<UserCommand>,
    em: EntityManager
  ): Promise<UserEntity | null> {
    switch (command.type) {
      case "CreateUserCommand":
        return this.createUser(authUser, command, em);
      case "UpdateUserCommand":
        return this.updateUser(authUser, command, em);
      case "DeleteUserCommand":
        return this.deleteUser(authUser, command, em).then(() => null);
    }
  }

  override async checkWriteable(
    entity: UserEntity,
    authUser: AuthUser
  ): Promise<void> {
    await super.checkWriteable(entity, authUser);
    if (
      authUser.user != null &&
      entity.id !== authUser.user.id &&
      compareRole(authUser.user.role, entity.role) <= 0
    ) {
      throw new NoPermissionError(this.type, "WRITE");
    }
  }

  async handleAdditionalQuery(
    authUser: AuthUser,
    entities: UserEntity[],
    query: AdditionalQuery
  ): Promise<UserEntity[]> {
    if (query.type === "FullTextQuery") {
      const value = await filterAsync(entities, async (entity) =>
        fullTextSearch(entity, query)
      );
      console.log("value: ", value);
      return value;
    } else {
      return super.handleAdditionalQuery(authUser, entities, query);
    }
  }

  doGetQueries(query: UserQuery): [AdditionalQuery[], ObjectQuery<UserEntity>] {
    const additionalQuery: AdditionalQuery[] = [];
    const objectQuery: ObjectQuery<UserEntity> = {};

    for (const [key, value] of Object.entries(query)) {
      if (key === "id" && !isEmpty(value)) {
        objectQuery.id = value;
      } else if (key === "name") {
        if (typeof value === "string" && !isEmpty(value)) {
          objectQuery.name = value;
        } else if (
          FULL_TEXT_OPERATOR in value &&
          !isEmpty(value[FULL_TEXT_OPERATOR])
        ) {
          additionalQuery.push({
            type: "FullTextQuery",
            value: value[FULL_TEXT_OPERATOR],
            fields: ["name"],
          });
        }
      } else if (key === "role") {
        objectQuery.role = value;
      } else if (key === "authId" && !isEmpty(value)) {
        objectQuery.authIds = value;
      }
    }

    return [additionalQuery, objectQuery];
  }

  override async isReadable(
    _: UserEntity,
    { user }: AuthUser
  ): Promise<boolean> {
    return (user?.role ?? RoleValue.USER) !== RoleValue.USER;
  }
}
