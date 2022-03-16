import AbstractEntity from "../../shared/abstract-entity";
import { Group } from "../group";
import { User } from "../user";
import { DistributiveOmit } from "../../utils";
import {
  AccessItem,
  AccessItemCreateOptions,
  AccessItemGroup,
  AccessItemUser,
} from "./access-item";
import { AccessListValue } from "./journal-value";
import { Journal } from "./journal";

export type AccessListCreateOptions =
  | {
      type: "ITEMS";
      items?: Array<DistributiveOmit<AccessItemCreateOptions, "parent">>;
    }
  | { type: "USERS"; users: User[] }
  | { type: "GROUPS"; groups: Group[] };

const MAX_LENGTH_LIST = 32;

export class AccessList extends AbstractEntity<
  AccessList,
  AccessListValue,
  "AccessList"
> {
  #items: AccessItem[];

  override get entityType(): "AccessList" {
    return "AccessList";
  }

  constructor(
    private readonly journal: Journal,
    options: AccessListCreateOptions
  ) {
    super();
    let items: AccessItem[];
    if (options.type === "ITEMS") {
      items =
        options.items?.map((i) => {
          if (i.type === "USER") {
            return new AccessItemUser({ parent: this, user: i.user });
          }
          return new AccessItemGroup({ parent: this, group: i.group });
        }) ?? [];
    } else if (options.type === "USERS") {
      items = options.users.map(
        (user) => new AccessItemUser({ parent: this, user })
      );
    } else {
      items = options.groups.map(
        (group) => new AccessItemGroup({ parent: this, group })
      );
    }
    this.items = items;
  }

  get items(): AccessItem[] {
    return this.#items;
  }

  set items(value: AccessItem[]) {
    this.checkLength(value.length, "items", { max: MAX_LENGTH_LIST });
    this.#items = value;
  }

  contains(user: User): boolean {
    return this.items.some((i) => i.contains(user));
  }

  toValue(): AccessListValue {
    return { items: this.items.map((i) => i.toValue()) };
  }

  isReadable(user: User): boolean {
    return this.journal.isReadable(user);
  }

  isWritable(user: User): boolean {
    return this.journal.isWritable(user);
  }
}
