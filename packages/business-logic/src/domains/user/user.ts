import AbstractEntity from '../../shared/abstract-entity';
import { FieldValidationLengthError } from '../../shared/errors';
import { UserValue } from './user-value';

export type UserCreateOptions = {
  name: string;
  role: Role;
  authIds?: Map<string, string>;
};

export enum Role {
  USER,
  ADMIN,
  OWNER,
}

const MIN_LENGTH_NAME = 6;

const MAX_LENGTH_NAME = 50;

export class User extends AbstractEntity<User, UserValue> {
  #name: string;

  role: Role;

  authIds: Map<string, string>;

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
    if (result.length < MIN_LENGTH_NAME || result.length > MAX_LENGTH_NAME) {
      throw new FieldValidationLengthError('User', 'name', MIN_LENGTH_NAME, MAX_LENGTH_NAME);
    }
    this.#name = result;
  }

  isReadable(): boolean {
    return true;
  }

  isWritable(user: User): boolean {
    return user.id === this.id || user.role > this.role;
  }

  toValue(): UserValue {
    return { id: this.id, name: this.#name, role: this.role, authIds: this.authIds };
  }
}
