import {
  Collection,
  Entity,
  ManyToMany,
  Property,
  Unique,
} from "@mikro-orm/core";
import { AbstractEntity } from "../shared";
import { UserEntity } from "../user";

export const GROUP_TYPE = "group";

export const GROUP_TYPE_PLURAL = "groups";

@Entity({ collection: GROUP_TYPE })
export default class GroupEntity extends AbstractEntity<GroupEntity> {
  @Property({ type: "string" })
  @Unique()
  name: string;

  @Property({ type: "string", nullable: true })
  description?: string;

  @ManyToMany(() => UserEntity, (user) => user.adminInGroups, { owner: true })
  admins = new Collection<UserEntity>(this);

  @ManyToMany(() => UserEntity, (user) => user.memberInGroups, { owner: true })
  members = new Collection<UserEntity>(this);

  constructor(name: string, description: string | undefined) {
    super();
    this.name = name;
    this.description = description;
  }

  setAdmins(values: UserEntity[]): void {
    this.admins.set(values);
    this.members.remove(...values);
  }

  setMembers(values: UserEntity[]): void {
    this.members.set(values);
    this.admins.remove(...values);
  }
}
