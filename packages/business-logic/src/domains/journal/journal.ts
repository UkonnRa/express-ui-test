import AbstractEntity from '../../shared/abstract-entity';
import { AccessList, AccessListCreateOptions } from './access-list';
import { Role, User } from '../user';
import { JournalValue } from './journal-value';

export type JournalCreateOptions = {
  name: string;
  description: string;
  admins: AccessListCreateOptions;
  members: AccessListCreateOptions;
};

const MIN_LENGTH_NAME = 6;

const MAX_LENGTH_NAME = 50;

const MAX_LENGTH_DESCRIPTION = 400;

export const TYPE = 'Journal';

export class Journal extends AbstractEntity<Journal, JournalValue, typeof TYPE> {
  #name: string;

  #description: string;

  admins: AccessList;

  members: AccessList;

  override get entityType(): typeof TYPE {
    return TYPE;
  }

  constructor({ name, description, admins, members }: JournalCreateOptions) {
    super();
    this.name = name;
    this.description = description;
    this.admins = new AccessList(this, admins);
    this.members = new AccessList(this, members);
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    const result = value.trim();
    this.checkLength(result.length, 'name', { min: MIN_LENGTH_NAME, max: MAX_LENGTH_NAME });
    this.#description = result;
  }

  get description(): string {
    return this.#description;
  }

  set description(value: string) {
    const result = value.trim();
    this.checkLength(value.length, 'description', { max: MAX_LENGTH_DESCRIPTION });
    this.#description = result;
  }

  isReadable(user: User): boolean {
    return this.isWritable(user) || this.members.contains(user);
  }

  isWritable(user: User): boolean {
    return user.role !== Role.USER || this.admins.contains(user);
  }

  toValue(): JournalValue {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      admins: this.admins.toValue(),
      members: this.members.toValue(),
    };
  }
}
