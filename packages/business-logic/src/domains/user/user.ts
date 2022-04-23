import { Role, TYPE_USER, UserValue } from "@white-rabbit/type-bridge";
import AbstractEntity from "../../shared/abstract-entity";

export interface UserCreateOptions {
  name: string;
  role: Role;
  authIds?: Map<string, string>;
}

const MIN_LENGTH_NAME = 6;

const MAX_LENGTH_NAME = 50;

const MAX_LENGTH_AUTH_IDS = 6;

export class User extends AbstractEntity<User, UserValue> {
  #name: string;

  role: Role;

  #authIds: Map<string, string>;

  get entityType(): symbol {
    return TYPE_USER;
  }

  constructor({ name, role, authIds }: UserCreateOptions) {
    super();
    this.name = name;
    this.role = role;
    this.authIds = authIds ?? new Map();
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

  get authIds(): Map<string, string> {
    return this.#authIds;
  }

  set authIds(value: Map<string, string>) {
    this.checkLength(value.size, "authIds", { max: MAX_LENGTH_AUTH_IDS });
    this.#authIds = value;
  }

  isReadable(): boolean {
    return true;
  }

  isWritable(user: User): boolean {
    return user.id === this.id || user.role > this.role;
  }

  toValue(): UserValue {
    return {
      id: this.id,
      name: this.#name,
      role: this.role,
      authIds: this.authIds,
    };
  }
}
