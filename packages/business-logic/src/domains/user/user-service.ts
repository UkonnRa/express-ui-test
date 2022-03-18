import { inject, singleton } from "tsyringe";
import AbstractService from "../../shared/abstract-service";
import AuthUser from "../../shared/auth-user";
import {
  NoAuthError,
  NoExpectedScopeError,
  NotFoundError,
} from "../../shared/errors";
import { UserRepository } from "../index";
import { UserValue } from "./user-value";
import { UserQuery } from "./user-query";
import { Role, TYPE, User } from "./user";
import {
  UserCommand,
  UserCommandCreate,
  UserCommandDelete,
  UserCommandUpdate,
} from "./user-command";

@singleton()
export default class UserService extends AbstractService<
  User,
  UserRepository,
  UserValue,
  UserQuery,
  UserCommand
> {
  constructor(
    @inject("UserRepository")
    protected override readonly repository: UserRepository
  ) {
    super(TYPE, "users:read", "users:write", repository);
  }

  async createUser(
    { authId, authIdValue, user, scopes }: AuthUser,
    { name, role, authIds }: UserCommandCreate
  ): Promise<string> {
    if (!scopes.includes(this.writeScope)) {
      throw new NoExpectedScopeError(authIdValue, this.writeScope);
    }

    let result: User;
    if (user == null) {
      if (role !== Role.USER) {
        throw new NoAuthError(this.type, user, undefined, "role");
      }

      if (authIds != null && authIds.size > 0) {
        throw new NoAuthError(this.type, user, undefined, "authIds");
      }

      result = new User({
        name,
        role,
        authIds: new Map([[authId.provider, authId.id]]),
      });
    } else if (user.role > role) {
      result = new User({ name, role, authIds });
    } else {
      throw new NoAuthError(this.type, user.id);
    }

    await this.repository.save(result);
    return result.id;
  }

  async updateUser(
    authUser: AuthUser,
    { id, name, role, authIds }: UserCommandUpdate
  ): Promise<string> {
    const entity = await this.getEntity(authUser, id);

    const operator = authUser.user;
    if (operator == null) {
      throw new NotFoundError("User", authUser.authIdValue);
    }

    if (name != null && role != null && authIds == null) {
      return entity.id;
    }

    if (name != null) {
      entity.name = name;
    }

    if (role != null) {
      if (operator.role > role) {
        entity.role = role;
      } else {
        throw new NoAuthError(this.type, operator.id, id, "role");
      }
    }

    if (authIds != null) {
      if (operator.role > Role.USER) {
        entity.authIds = authIds;
      } else {
        throw new NoAuthError(this.type, operator.id, id, "authIds");
      }
    }

    await this.repository.save(entity);

    return entity.id;
  }

  async deleteUser(
    authUser: AuthUser,
    { id }: UserCommandDelete
  ): Promise<string> {
    const entity = await this.getEntity(authUser, id);

    entity.deleted = true;

    await this.repository.save(entity);

    return entity.id;
  }

  async handle(authUser: AuthUser, command: UserCommand): Promise<string> {
    if (command.type === "UserCommandCreate") {
      return this.createUser(authUser, command);
    } else if (command.type === "UserCommandUpdate") {
      return this.updateUser(authUser, command);
    } else if (command.type === "UserCommandRebindAuthProvider") {
      throw new Error("Unimplemented");
    } else {
      return this.deleteUser(authUser, command);
    }
  }
}
