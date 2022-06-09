import { AuthUser, CommandsInput, Service } from "../shared";
import { EntityDTO, EntityManager, MikroORM } from "@mikro-orm/core";
import { singleton } from "tsyringe";
import RoleValue from "./role.value";
import UserEntity, { USER_TYPE } from "./user.entity";
import UserCommand from "./user.command";
import CommandInput from "../shared/command.input";
import CreateUserCommand from "./create-user.command";
import UpdateUserCommand from "./update-user.command";
import DeleteUserCommand from "./delete-user.command";
import { AlreadyExistError, NoPermissionError, NotFoundError } from "../error";
import RequiredFieldError from "../error/required-field.error";

export const USER_READ_SCOPE = "urn:alices-wonderland:white-rabbit:users:read";
export const USER_WRITE_SCOPE =
  "urn:alices-wonderland:white-rabbit:users:write";

@singleton()
export default class UserService extends Service<UserEntity, UserCommand> {
  constructor(orm: MikroORM) {
    super(orm, USER_READ_SCOPE, USER_WRITE_SCOPE, UserEntity, USER_TYPE);
  }

  private async createUser(
    authUser: AuthUser,
    command: CreateUserCommand,
    em: EntityManager
  ): Promise<UserEntity> {
    const role = command.role ?? RoleValue.USER;

    if (authUser.user == null && role !== RoleValue.USER) {
      throw new NoPermissionError(this.type, "WRITE");
    }
    if (authUser.user != null && authUser.user.role <= role) {
      throw new NoPermissionError(this.type, "WRITE");
    }

    if ((await em.findOne(this.entityType, { name: command.name })) != null) {
      throw new AlreadyExistError(this.type, "name", command.name);
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
      command.role == null &&
      command.authIds == null
    ) {
      return entity;
    }

    if (command.role != null) {
      // If the role of authUser is smaller than either of the command or the existing entity, throw error
      if (
        authUser.user?.role == null ||
        authUser.user.role <= command.role ||
        authUser.user.role <= entity.role
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

  override async handle(
    { command, authUser }: CommandInput<UserCommand>,
    em?: EntityManager
  ): Promise<EntityDTO<UserEntity> | null> {
    const emInst = em ?? this.orm.em.fork();
    switch (command.type) {
      case "CreateUserCommand":
        return this.createUser(authUser, command, emInst).then((u) =>
          u.toObject()
        );
      case "UpdateUserCommand":
        return this.updateUser(authUser, command, emInst).then((u) =>
          u.toObject()
        );
      case "DeleteUserCommand":
        return this.deleteUser(authUser, command, emInst).then(() => null);
    }
  }

  override async handleAll(
    { authUser, commands }: CommandsInput<UserCommand>,
    em?: EntityManager
  ): Promise<Array<EntityDTO<UserEntity> | null>> {
    return (em ?? this.orm.em.fork()).transactional(async (emInst) => {
      const idMap: Record<string, string> = {};
      const results = [];
      for (const command of commands) {
        if (command.type === "CreateUserCommand") {
          const result = await this.handle({ authUser, command }, emInst);
          results.push(result);
          if (result != null && command.targetId != null) {
            idMap[command.targetId] = result.id;
          }
        } else if (command.targetId != null) {
          const result = await this.handle(
            {
              authUser,
              command: {
                ...command,
                targetId: idMap[command.targetId] ?? command.targetId,
              },
            },
            emInst
          );
          results.push(result);
        } else {
          throw new RequiredFieldError(command.type, "id");
        }
      }
      return results;
    });
  }

  async isReadable(entity: UserEntity, authUser?: AuthUser): Promise<boolean> {
    // User can read all users
    return this.doGeneralPermissionCheck(this.readScope, entity, authUser);
  }

  async isWriteable(entity: UserEntity, authUser?: AuthUser): Promise<boolean> {
    if (!this.doGeneralPermissionCheck(this.writeScope, entity, authUser)) {
      return false;
    }

    // User can update himself
    if (entity.id === authUser?.user?.id) {
      return true;
    }

    // User can update others whose role is smaller than him
    return authUser?.user != null && authUser.user.role > entity.role;
  }
}
