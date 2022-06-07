import { AuthUser, Service } from "../shared";
import { MikroORM } from "@mikro-orm/core";
import { singleton } from "tsyringe";
import RoleValue from "./role.value";
import UserEntity from "./user.entity";
import UserValue from "./user.value";
import UserCommand from "./user.command";

export const USER_READ_SCOPE = "urn:alices-wonderland:white-rabbit:users:read";
export const USER_WRITE_SCOPE =
  "urn:alices-wonderland:white-rabbit:users:write";

@singleton()
export default class UserService extends Service<
  UserEntity,
  UserValue,
  UserCommand
> {
  constructor(orm: MikroORM) {
    super(orm, USER_READ_SCOPE, USER_WRITE_SCOPE, UserEntity);
  }

  override handle(): UserEntity | null {
    return null;
  }

  override handleAll(): Array<UserEntity | null> {
    return [];
  }

  override toValue(entity: UserEntity): UserValue {
    return {
      id: entity.id,
      name: entity.name,
      role: entity.role,
      authIds: entity.authIds,
    };
  }

  isReadable(entity: UserEntity, authUser?: AuthUser): boolean {
    if (authUser == null || !authUser.scopes.includes(this.readScope)) {
      return false;
    } else if (entity.deletedAt != null) {
      return (authUser.user?.role ?? RoleValue.USER) > RoleValue.USER;
    }
    return true;
  }

  isWriteable(entity: UserEntity, authUser?: AuthUser): boolean {
    return authUser?.user != null && authUser.user.role > entity.role;
  }

  async handleAdditionalQueries(entities: UserEntity[]): Promise<UserEntity[]> {
    return entities;
  }
}
