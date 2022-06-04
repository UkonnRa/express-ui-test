import { Embedded, Entity, Enum, Property, Unique } from "@mikro-orm/core";
import { AuthIdValue, RoleValue } from "./index";
import { AbstractEntity } from "../shared";

@Entity()
export default class UserEntity extends AbstractEntity<UserEntity> {
  @Property({ type: "string" })
  @Unique()
  name: string;

  @Enum(() => RoleValue)
  role: RoleValue;

  @Embedded(() => AuthIdValue, { array: true })
  authIds: AuthIdValue[];

  constructor(name: string, role: RoleValue, authIds: AuthIdValue[]) {
    super();
    this.name = name;
    this.role = role;
    this.authIds = authIds;
  }
}
