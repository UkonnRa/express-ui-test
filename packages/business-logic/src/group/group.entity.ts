import {
  Collection,
  Entity,
  ManyToMany,
  Property,
  Unique,
} from "@mikro-orm/core";
import { AbstractEntity } from "../shared";
import { UserEntity } from "../user";

@Entity({ collection: "group" })
export default class GroupEntity extends AbstractEntity<GroupEntity> {
  @Property({ type: "string" })
  @Unique()
  name: string;

  @Property({ type: "string", nullable: true })
  description?: string;

  @ManyToMany(() => UserEntity)
  admins: Collection<UserEntity> = new Collection<UserEntity>(this);

  @ManyToMany(() => UserEntity)
  members: Collection<UserEntity> = new Collection<UserEntity>(this);

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
