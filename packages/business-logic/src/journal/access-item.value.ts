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

  @ManyToOne(() => JournalEntity, {
    onDelete: "cascade",
    onUpdateIntegrity: "cascade",
  })
  journal: JournalEntity;

  abstract get itemId(): string;

  abstract contains(user: string): Promise<boolean>;

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
  @ManyToOne(() => UserEntity, {
    eager: true,
    onDelete: "cascade",
    onUpdateIntegrity: "cascade",
  })
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
  async contains(userId: string): Promise<boolean> {
    return this.user.isInitialized() && userId === this.user.id;
  }
}

@Entity({ discriminatorValue: "group" })
export class AccessItemGroupValue extends AccessItemValue {
  @ManyToOne(() => GroupEntity, {
    eager: true,
    onDelete: "cascade",
    onUpdateIntegrity: "cascade",
  })
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
  async contains(userId: string): Promise<boolean> {
    return this.group.isInitialized() && this.group.contains(userId);
  }
}
