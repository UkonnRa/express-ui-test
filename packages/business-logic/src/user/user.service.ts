import { EntityManager, MikroORM } from "@mikro-orm/core";
import { inject, singleton } from "tsyringe";
import {
  AuthUser,
  checkCreate,
  WriteService,
  RoleValue,
  compareRole,
} from "../shared";
import CommandInput from "../shared/command.input";
import { NoPermissionError } from "../error";
import InvalidCommandError from "../error/invalid-command.error";
import UserEntity, { USER_TYPE } from "./user.entity";
import UserCommand from "./user.command";
import CreateUserCommand from "./create-user.command";
import UpdateUserCommand from "./update-user.command";
import DeleteUserCommand from "./delete-user.command";

export const USER_READ_SCOPE = "urn:alices-wonderland:white-rabbit:users:read";
export const USER_WRITE_SCOPE =
  "urn:alices-wonderland:white-rabbit:users:write";

@singleton()
export default class UserService extends WriteService<UserEntity, UserCommand> {
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
      authUser.user == null ? [authUser.authId] : command.authIds ?? []
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

  override async handle(
    { command, authUser }: CommandInput<UserCommand>,
    em?: EntityManager
  ): Promise<UserEntity | null> {
    const emInst = em ?? this.orm.em.fork();
    switch (command.type) {
      case "CreateUserCommand":
        return this.createUser(authUser, command, emInst);
      case "UpdateUserCommand":
        return this.updateUser(authUser, command, emInst);
      case "DeleteUserCommand":
        return this.deleteUser(authUser, command, emInst).then(() => null);
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
}
