import {
  Collection,
  Embedded,
  Entity,
  Enum,
  ManyToMany,
  Property,
  Unique,
} from "@mikro-orm/core";
import { AbstractEntity, RoleValue } from "../shared";
import { type GroupEntity } from "../group";
import AuthIdValue from "./auth-id.value";

export const USER_TYPE = "user";

export const USER_TYPE_PLURAL = "users";

@Entity({ collection: USER_TYPE })
export default class UserEntity extends AbstractEntity<UserEntity> {
  @Property({ type: "string" })
  @Unique()
  name: string;

  @Enum({ type: "string", items: () => RoleValue })
  role: RoleValue;

  @Embedded(() => AuthIdValue, { array: true })
  authIds: AuthIdValue[] = [];

  @ManyToMany("GroupEntity", (group: GroupEntity) => group.admins)
  adminInGroups = new Collection<GroupEntity>(this);

  @ManyToMany("GroupEntity", (group: GroupEntity) => group.members)
  memberInGroups = new Collection<GroupEntity>(this);

  constructor(name: string, role: RoleValue, authIds: AuthIdValue[]) {
    super();
    this.name = name;
    this.role = role;
    this.authIds = authIds;
  }
}
