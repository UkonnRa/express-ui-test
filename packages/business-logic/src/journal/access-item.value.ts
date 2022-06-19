import { Entity, Enum, ManyToOne, PrimaryKey, Unique } from "@mikro-orm/core";
import { v4 } from "uuid";
import { UserEntity } from "../user";
import { GroupEntity } from "../group";
// eslint-disable-next-line import/no-cycle
import JournalEntity, {
  AccessItemAccessibleType,
  AccessItemType,
} from "./journal.entity";

@Entity({
  discriminatorColumn: "type",
  abstract: true,
  collection: "access_item",
})
@Unique({ properties: ["type", "accessible", "journal", "user", "group"] })
export default abstract class AccessItemValue {
  // In PG, all fields in composite primary keys should be non-null, which does not match our case
  // Waiting for https://github.com/mikro-orm/mikro-orm/issues/1575
  @PrimaryKey({ type: "string" })
  id: string = v4();

  @Enum({ type: "string", items: ["user", "group"] })
  type: AccessItemType;

  @Enum({ type: "string", items: ["admin", "member"] })
  accessible: AccessItemAccessibleType;

  @ManyToOne(() => JournalEntity)
  journal: JournalEntity;

  abstract get itemId(): string;

  abstract contains(user: UserEntity): Promise<boolean>;

  static create(
    items: Array<UserEntity | GroupEntity>,
    accessible: AccessItemAccessibleType
  ): AccessItemValue[] {
    return items.map((item) =>
      item instanceof UserEntity
        ? new AccessItemUserValue(item, accessible)
        : new AccessItemGroupValue(item, accessible)
    );
  }
}

@Entity({ discriminatorValue: "user" })
export class AccessItemUserValue extends AccessItemValue {
  @ManyToOne(() => UserEntity, { eager: true })
  user: UserEntity;

  constructor(user: UserEntity, accessible: AccessItemAccessibleType) {
    super();
    this.type = "user";
    this.accessible = accessible;
    this.user = user;
  }

  get itemId(): string {
    return this.user.id;
  }

  // Only non-deleted user can be inited
  async contains(user: UserEntity): Promise<boolean> {
    return this.user.isInitialized() && user.id === this.user.id;
  }
}

@Entity({ discriminatorValue: "group" })
export class AccessItemGroupValue extends AccessItemValue {
  @ManyToOne(() => GroupEntity, { eager: true })
  group: GroupEntity;

  constructor(group: GroupEntity, accessible: AccessItemAccessibleType) {
    super();
    this.type = "group";
    this.accessible = accessible;
    this.group = group;
  }

  get itemId(): string {
    return this.group.id;
  }

  // Only non-deleted group can be inited
  async contains(user: UserEntity): Promise<boolean> {
    return this.group.isInitialized() && this.group.contains(user);
  }
}
