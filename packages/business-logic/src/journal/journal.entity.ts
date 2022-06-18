import {
  Collection,
  Entity,
  OneToMany,
  Property,
  Unique,
  types,
} from "@mikro-orm/core";
import { AbstractEntity } from "../shared";
import { UserEntity, USER_TYPE } from "../user";
import { GROUP_TYPE, GroupEntity } from "../group";
// eslint-disable-next-line import/no-cycle
import AccessItemValue from "./access-item.value";

export const JOURNAL_TYPE = "journal";

export const JOURNAL_TYPE_PLURAL = "journals";

export type AccessItemType = typeof USER_TYPE | typeof GROUP_TYPE;

export type AccessItemAccessibleType = "admin" | "member";

@Entity({ collection: JOURNAL_TYPE })
export default class JournalEntity extends AbstractEntity<JournalEntity> {
  @Property({ type: "string" })
  @Unique()
  name: string;

  @Property({ type: "string" })
  description: string;

  @Property({ type: types.array })
  tags: Set<string> = new Set();

  @Property({ type: "string" })
  unit: string;

  @Property({ type: "boolean" })
  archived: boolean = false;

  @OneToMany(() => AccessItemValue, (item) => item.journal, {
    orphanRemoval: true,
    eager: true,
  })
  accessItems = new Collection<AccessItemValue>(this);

  constructor(
    name: string,
    description: string,
    tags: Iterable<string>,
    unit: string
  ) {
    super();
    this.name = name;
    this.description = description;
    this.tags = new Set(tags);
    this.unit = unit;
  }

  setAccessItems(
    items: Array<UserEntity | GroupEntity>,
    accessible: AccessItemAccessibleType
  ): void {
    this.accessItems.remove(
      (item) =>
        item.accessible === accessible ||
        items.some((newItem) => newItem.id === item.itemId)
    );
    this.accessItems.add(...AccessItemValue.create(items, accessible));
  }

  get admins(): AccessItemValue[] {
    return this.accessItems
      .getItems()
      .filter((item) => item.accessible === "admin");
  }

  get members(): AccessItemValue[] {
    return this.accessItems
      .getItems()
      .filter((item) => item.accessible === "member");
  }
}
