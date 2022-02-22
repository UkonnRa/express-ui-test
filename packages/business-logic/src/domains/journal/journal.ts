import { FinRecordCreateOptions, AccountCreateOptions } from '../fin-record';
import AbstractEntity from '../../shared/abstract-entity';
import { AccessList, AccessListCreateOptions } from './access-list';
import { FieldValidationLengthError } from '../../shared/errors';
import { Role, User } from '../user';
import { JournalValue } from './journal-value';

export type JournalCreateOptions = {
  name: string;
  description: string;
  admins: AccessListCreateOptions;
  members: AccessListCreateOptions;
  records?: Omit<FinRecordCreateOptions, 'journal'>[];
  accounts?: Omit<AccountCreateOptions, 'journal'>[];
};

const MIN_LENGTH_NAME = 6;

const MAX_LENGTH_NAME = 50;

const MAX_LENGTH_DESCRIPTION = 400;

export class Journal extends AbstractEntity<Journal, JournalValue> {
  #name: string;

  #description: string;

  admins: AccessList;

  members: AccessList;

  constructor({ name, description, admins, members }: JournalCreateOptions) {
    super();
    this.name = name;
    this.description = description;
    this.admins = new AccessList(admins);
    this.members = new AccessList(members);
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    const result = value.trim();
    if (result.length < MIN_LENGTH_NAME || result.length > MAX_LENGTH_NAME) {
      throw new FieldValidationLengthError('Journal', 'name', MIN_LENGTH_NAME, MAX_LENGTH_NAME);
    }
    this.#name = result;
  }

  get description(): string {
    return this.#description;
  }

  set description(value: string) {
    const result = value.trim();
    if (result.length > MAX_LENGTH_DESCRIPTION) {
      throw new FieldValidationLengthError('Journal', 'description', undefined, MAX_LENGTH_DESCRIPTION);
    }
    this.#description = value;
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
