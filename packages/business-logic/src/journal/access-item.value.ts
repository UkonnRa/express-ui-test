import { Entity, Enum, ManyToOne } from "@mikro-orm/core";
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
export default abstract class AccessItemValue {
  @Enum({ type: "string", items: ["user", "group"], primary: true })
  type: AccessItemType;

  @Enum({ type: "string", items: ["admin", "member"], primary: true })
  accessible: AccessItemAccessibleType;

  @ManyToOne(() => JournalEntity, { primary: true })
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
  @ManyToOne(() => UserEntity, { primary: true })
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

  async contains(user: UserEntity): Promise<boolean> {
    return user.id === this.user.id;
  }
}

@Entity({ discriminatorValue: "group" })
export class AccessItemGroupValue extends AccessItemValue {
  @ManyToOne(() => GroupEntity, { primary: true })
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

  async contains(user: UserEntity): Promise<boolean> {
    return this.group.contains(user);
  }
}
