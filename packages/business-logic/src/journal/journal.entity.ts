import {
  Cascade,
  Collection,
  Entity,
  OneToMany,
  Property,
  types,
  Unique,
} from "@mikro-orm/core";
import { AbstractEntity } from "../shared";
import { UserEntity } from "../user";
import { GroupEntity } from "../group";
// eslint-disable-next-line import/no-cycle
import AccessItemValue from "./access-item.value";
import AccessItemAccessibleTypeValue from "./access-item-accessible-type.value";

export const JOURNAL_TYPE = "journal";

export const JOURNAL_TYPE_PLURAL = "journals";

@Entity({ collection: JOURNAL_TYPE })
export default class JournalEntity extends AbstractEntity<JournalEntity> {
  @Property({ type: "string" })
  @Unique()
  name: string;

  @Property({ type: "string" })
  description: string;

  @Property({ name: "tags", type: types.array })
  _tags: string[];

  get tags(): string[] {
    return this._tags;
  }

  set tags(value: Iterable<string>) {
    this._tags = [...new Set(value)];
  }

  @Property({ type: "string" })
  unit: string;

  @Property({ type: "boolean" })
  archived: boolean = false;

  @OneToMany(() => AccessItemValue, (item) => item.journal, {
    orphanRemoval: true,
    eager: true,
    cascade: [Cascade.ALL],
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
    this.tags = tags;
    this.unit = unit;
  }

  setAccessItems(
    items: Array<UserEntity | GroupEntity>,
    accessible: AccessItemAccessibleTypeValue
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
      .filter(
        (item) => item.accessible === AccessItemAccessibleTypeValue.ADMIN
      );
  }

  get members(): AccessItemValue[] {
    return this.accessItems
      .getItems()
      .filter(
        (item) => item.accessible === AccessItemAccessibleTypeValue.MEMBER
      );
  }
}
