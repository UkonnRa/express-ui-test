import { GroupValue, Role, TYPE_GROUP } from "@white-rabbit/type-bridge";
import AbstractEntity from "../../shared/abstract-entity";
import { User } from "../user";

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

export class Group extends AbstractEntity<Group, GroupValue> {
  #name: string;

  #description: string;

  #members: User[] = [];

  #admins: User[] = [];

  constructor({ name, description, admins, members }: GroupCreateOptions) {
    super();
    this.name = name;
    this.description = description;
    this.members = members;
    this.admins = admins;
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
    const result = new Map(value.map((v) => [v.id, v]));
    this.checkLength(result.size, "admins", { max: MAX_LENGTH_LIST });
    this.#admins = [...result.values()];
    this.members = this.#members;
  }

  get members(): User[] {
    return this.#members;
  }

  set members(value: User[]) {
    const result = new Map(
      value
        .filter(({ id }) => !this.admins.some((v) => v.id === id))
        .map((v) => [v.id, v])
    );
    this.checkLength(result.size, "members", { max: MAX_LENGTH_LIST });
    this.#members = [...result.values()];
  }

  public contains(userId: string, field?: "admins" | "members"): boolean {
    const adminContains = this.admins.some(({ id }) => id === userId);
    const memberContains = this.members.some(({ id }) => id === userId);
    if (field === "admins") {
      return adminContains;
    } else if (field === "members") {
      return memberContains;
    } else {
      return adminContains || memberContains;
    }
  }

  isReadable(user: User): boolean {
    return (
      this.isWritable(user) || this.members.some(({ id }) => id === user.id)
    );
  }

  isWritable(user: User): boolean {
    return (
      user.role !== Role.USER || this.admins.some(({ id }) => id === user.id)
    );
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

  get entityType(): symbol {
    return TYPE_GROUP;
  }
}
