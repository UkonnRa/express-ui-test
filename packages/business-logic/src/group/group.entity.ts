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

  @Property({ type: "string" })
  description: string;

  @ManyToMany(() => UserEntity, (user) => user.adminInGroups, {
    owner: true,
    eager: true,
  })
  admins = new Collection<UserEntity>(this);

  @ManyToMany(() => UserEntity, (user) => user.memberInGroups, {
    owner: true,
    eager: true,
  })
  members = new Collection<UserEntity>(this);

  constructor(name: string, description: string) {
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

  async contains(
    userId: string,
    fields: Array<"admins" | "members"> = ["admins", "members"]
  ): Promise<boolean> {
    let result = false;
    for (const field of fields) {
      const collection = this[field];
      if (!collection.isInitialized()) {
        await collection.init();
      }
      result =
        result || collection.getItems().some((item) => item.id === userId);
    }
    return result;
  }
}
