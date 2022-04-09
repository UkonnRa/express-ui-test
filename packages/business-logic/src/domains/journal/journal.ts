import AbstractEntity from "../../shared/abstract-entity";
import { Role, User } from "../user";
import { Group } from "../group";
import { AccessItemValue, JournalValue } from "./journal-value";

export type AccessList = Array<User | Group>;

export interface JournalCreateOptions {
  name: string;
  description: string;
  admins: AccessList;
  members: AccessList;
}

const MIN_LENGTH_NAME = 6;

const MAX_LENGTH_NAME = 50;

const MAX_LENGTH_DESCRIPTION = 400;

const MAX_LENGTH_LIST = 16;

export const TYPE = "Journal";

export class Journal extends AbstractEntity<
  Journal,
  JournalValue,
  typeof TYPE
> {
  #name: string;

  #description: string;

  #admins: AccessList = [];

  #members: AccessList = [];

  override get entityType(): typeof TYPE {
    return TYPE;
  }

  constructor({ name, description, admins, members }: JournalCreateOptions) {
    super();
    this.name = name;
    this.description = description;
    this.admins = admins;
    this.members = members;
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    const result = value.trim();
    this.checkLength(result.length, "name", {
      min: MIN_LENGTH_NAME,
      max: MAX_LENGTH_NAME,
    });
    this.#name = result;
  }

  get description(): string {
    return this.#description;
  }

  set description(value: string) {
    const result = value.trim();
    this.checkLength(value.length, "description", {
      max: MAX_LENGTH_DESCRIPTION,
    });
    this.#description = result;
  }

  private static getAccessItemId(item: User | Group): string {
    return `${item.entityType}${item.id}`;
  }

  private static accessListContains(
    accessList: AccessList,
    user: User
  ): boolean {
    for (const item of accessList) {
      if (
        (item instanceof User && item.id === user.id) ||
        (item instanceof Group && item.contains(user.id))
      ) {
        return true;
      }
    }
    return false;
  }

  get admins(): AccessList {
    return this.#admins;
  }

  set admins(value: AccessList) {
    const result = new Map(value.map((v) => [Journal.getAccessItemId(v), v]));
    this.checkLength(result.size, "admins", { max: MAX_LENGTH_LIST });
    this.#admins = [...result.values()];
    this.members = this.#members;
  }

  get members(): AccessList {
    return this.#members;
  }

  set members(value: AccessList) {
    const result = new Map(
      value
        .filter(
          (member) =>
            !this.admins.some(
              (admin) =>
                Journal.getAccessItemId(admin) ===
                Journal.getAccessItemId(member)
            )
        )
        .map((v) => [Journal.getAccessItemId(v), v])
    );
    this.checkLength(result.size, "members", { max: MAX_LENGTH_LIST });
    this.#members = [...result.values()];
  }

  isReadable(user: User): boolean {
    return (
      this.isWritable(user) || Journal.accessListContains(this.members, user)
    );
  }

  isWritable(user: User): boolean {
    return (
      user.role !== Role.USER || Journal.accessListContains(this.admins, user)
    );
  }

  static toAccessListValue(accessList: AccessList): AccessItemValue[] {
    return accessList.map((v) => ({ type: v.entityType, id: v.id }));
  }

  toValue(): JournalValue {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      admins: Journal.toAccessListValue(this.admins),
      members: Journal.toAccessListValue(this.members),
    };
  }
}
