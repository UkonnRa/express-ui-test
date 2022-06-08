import { Embedded, Entity, Enum, Property, Unique } from "@mikro-orm/core";
import { AbstractEntity } from "../shared";
import RoleValue from "./role.value";
import AuthIdValue from "./auth-id.value";

export const USER_TYPE = "user";

export const USER_TYPE_PLURAL = "users";

@Entity({ collection: USER_TYPE })
export default class UserEntity extends AbstractEntity<UserEntity> {
  @Property({ type: "string" })
  @Unique()
  name: string;

  @Enum(() => RoleValue)
  role: RoleValue;

  @Embedded(() => AuthIdValue, { array: true })
  authIds: AuthIdValue[] = [];

  constructor(name: string, role: RoleValue, authIds: AuthIdValue[]) {
    super();
    this.name = name;
    this.role = role;
    this.authIds = authIds;
  }
}
