import {
  Collection,
  Entity,
  ManyToMany,
  Property,
  Unique,
} from "@mikro-orm/core";
import { AbstractEntity } from "../shared";
import { UserEntity } from "../user";
import { CreateGroupInput } from "./index";

@Entity()
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

  constructor({ name, description, admins, members }: CreateGroupInput) {
    super();
    this.name = name;
    this.description = description;
    this.admins.set(admins);
    this.members.set(members);
  }
}
