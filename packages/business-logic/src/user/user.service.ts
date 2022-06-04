import { AuthUser, Service } from "../shared";
import { UserCommand, UserEntity, UserValue } from "./index";
import { MikroORM } from "@mikro-orm/core";
import { singleton } from "tsyringe";
import RoleValue from "./role.value";

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
}
