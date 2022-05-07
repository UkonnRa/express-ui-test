import { inject, singleton } from "tsyringe";
import {
  Role,
  TYPE_USER,
  UserCommand,
  UserCommandCreate,
  UserCommandDelete,
  UserCommandRebindAuthProvider,
  UserCommandUpdate,
  UserQuery,
  UserValue,
} from "@white-rabbit/type-bridge";
import AbstractService from "../../shared/abstract-service";
import { AuthUser } from "../../shared/auth-user";
import { NoAuthError, NoExpectedScopeError } from "../../shared/errors";
import { UserRepository } from "../index";
import { User } from "./user";

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
    super(TYPE_USER, "users:read", "users:write", repository);
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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const operator = authUser.user!;

    if (name == null && role == null && authIds == null) {
      return entity.id;
    }

    if (name != null) {
      entity.name = name;
    }

    if (role != null) {
      if (operator.role > role) {
        entity.role = role;
      } else {
        throw new NoAuthError(entity.entityType, operator.id, id, "role");
      }
    }

    if (authIds != null) {
      if (operator.role > Role.USER) {
        entity.authIds = authIds;
      } else {
        throw new NoAuthError(entity.entityType, operator.id, id, "authIds");
      }
    }

    await this.repository.save(entity);
    return entity.id;
  }

  async rebindAuthId(
    authUser: AuthUser,
    command: UserCommandRebindAuthProvider
  ): Promise<string> {
    const entity = await this.getEntity(authUser, command.id);
    const { provider, id } = authUser.authId;
    entity.authIds.set(provider, id);
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
      return this.rebindAuthId(authUser, command);
    } else {
      return this.deleteUser(authUser, command);
    }
  }
}
