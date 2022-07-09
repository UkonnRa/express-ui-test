import {
  Collection,
  Entity,
  Enum,
  ManyToMany,
  Property,
  Unique,
} from "@mikro-orm/core";
import { RoleValue } from "@white-rabbit/types";
import { AbstractEntity } from "../shared";
import { type GroupEntity } from "../group";

export const USER_TYPE = "user";

export const USER_TYPE_PLURAL = "users";

@Entity({ collection: USER_TYPE })
export default class UserEntity extends AbstractEntity<UserEntity> {
  @Property({ type: "string" })
  @Unique()
  name: string;

  @Enum({ type: "string", items: () => RoleValue })
  role: RoleValue;

  @Property({ type: "json" })
  authIds: Record<string, string>;

  @ManyToMany("GroupEntity", (group: GroupEntity) => group.admins)
  adminInGroups = new Collection<GroupEntity>(this);

  @ManyToMany("GroupEntity", (group: GroupEntity) => group.members)
  memberInGroups = new Collection<GroupEntity>(this);

  constructor(name: string, role: RoleValue, authIds: Record<string, string>) {
    super();
    this.name = name;
    this.role = role;
    this.authIds = authIds;
  }
}
