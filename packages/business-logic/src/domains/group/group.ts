import AbstractEntity from "../../shared/abstract-entity";
import { User } from "../user";
import { GroupValue } from "./group-value";

export interface GroupCreateOptions {
  name: string;

  description: string;

  admins: User[];

  members: User[];
}

const MIN_LENGTH_NAME = 6;

const MAX_LENGTH_NAME = 50;

const MAX_LENGTH_DESCRIPTION = 400;

const MAX_LENGTH_LIST = 256;

export const TYPE = "Group";

export class Group extends AbstractEntity<Group, GroupValue, typeof TYPE> {
  #name: string;

  #description: string;

  #admins: User[];

  #members: User[];

  constructor({ name, description, admins, members }: GroupCreateOptions) {
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

  get admins(): User[] {
    return this.#admins;
  }

  set admins(value: User[]) {
    this.checkLength(value.length, "admins", { max: MAX_LENGTH_LIST });
    this.#admins = value;
    this.members = this.#members;
  }

  get members(): User[] {
    return this.#members;
  }

  set members(value: User[]) {
    const result = value.filter(
      ({ id }) => !this.admins.some((v) => v.id === id)
    );
    this.checkLength(value.length, "members", { max: MAX_LENGTH_LIST });
    this.#members = result;
  }

  public contains(user: User): boolean {
    return this.isReadable(user);
  }

  isReadable(user: User): boolean {
    return (
      this.isWritable(user) || this.members.some(({ id }) => id === user.id)
    );
  }

  isWritable(user: User): boolean {
    return this.admins.some(({ id }) => id === user.id);
  }

  toValue(): GroupValue {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      admins: this.admins.map(({ id }) => id),
      members: this.members.map(({ id }) => id),
    };
  }

  get entityType(): typeof TYPE {
    return TYPE;
  }
}
