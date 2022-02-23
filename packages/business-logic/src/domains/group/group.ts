import AbstractEntity from '../../shared/abstract-entity';
import { User } from '../user';
import { FieldValidationLengthError } from '../../shared/errors';
import { GroupValue } from './group-value';

export type GroupCreateOptions = {
  name: string;

  description: string;

  admins: User[];

  members: User[];
};

const MIN_LENGTH_NAME = 6;

const MAX_LENGTH_NAME = 50;

const MAX_LENGTH_DESCRIPTION = 400;

const MAX_LENGTH_LIST = 256;

export class Group extends AbstractEntity<Group, GroupValue> {
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
    if (result.length < MIN_LENGTH_NAME || result.length > MAX_LENGTH_NAME) {
      throw new FieldValidationLengthError('Group', 'name', MIN_LENGTH_NAME, MAX_LENGTH_NAME);
    }
    this.#name = result;
  }

  get description(): string {
    return this.#description;
  }

  set description(value: string) {
    const result = value.trim();
    if (result.length > MAX_LENGTH_DESCRIPTION) {
      throw new FieldValidationLengthError('Group', 'description', undefined, MAX_LENGTH_DESCRIPTION);
    }
    this.#description = value;
  }

  get admins(): User[] {
    return this.#admins;
  }

  set admins(value: User[]) {
    if (value.length > MAX_LENGTH_LIST) {
      throw new FieldValidationLengthError('Group', 'admins', undefined, MAX_LENGTH_NAME);
    }
    this.#admins = value;
    this.members = this.#members;
  }

  get members(): User[] {
    return this.#members;
  }

  set members(value: User[]) {
    const result = value.filter(({ id }) => !this.admins.some((v) => v.id === id));
    if (result.length > MAX_LENGTH_LIST) {
      throw new FieldValidationLengthError('Group', 'members', undefined, MAX_LENGTH_NAME);
    }
    this.#members = result;
  }

  public contains(user: User): boolean {
    return this.isReadable(user);
  }

  isReadable(user: User): boolean {
    return this.isWritable(user) || this.members.some(({ id }) => id === user.id);
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
}
