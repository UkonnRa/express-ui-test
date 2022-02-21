import { FinRecord, FinRecordCreateOptions, Account, AccountCreateOptions } from '../fin-record';
import AbstractEntity from '../../shared/abstract-entity';
import { AccessList, AccessListCreateOptions } from './access-list';
import { FieldValidationLengthError } from '../../shared/errors';
import { Role, User } from '../user';
import { JournalProjection } from './journal-projection';

export type JournalCreateOptions = {
  name: string;
  description: string;
  admins: AccessListCreateOptions;
  members: AccessListCreateOptions;
  records?: Omit<FinRecordCreateOptions, 'journal'>[];
  accounts?: Omit<AccountCreateOptions, 'journal'>[];
};

const MAX_LENGTH_NAME = 20;

const MAX_LENGTH_DESCRIPTION = 400;

export class Journal extends AbstractEntity<Journal, JournalProjection> {
  #name: string;

  #description: string;

  admins: AccessList;

  members: AccessList;

  readonly records: FinRecord[];

  readonly accounts: Account[];

  constructor({ name, description, admins, members, records, accounts }: JournalCreateOptions) {
    super();
    this.name = name;
    this.description = description;
    this.admins = new AccessList(admins);
    this.members = new AccessList(members);
    this.records = records?.map((record) => new FinRecord({ ...record, journal: this })) ?? [];
    this.accounts = accounts?.map((account) => new Account({ ...account, journal: this })) ?? [];
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    const result = value.trim();
    if (result.length === 0 || result.length > MAX_LENGTH_NAME) {
      throw new FieldValidationLengthError('Journal', 'name', 0, MAX_LENGTH_NAME);
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

  toProjection(): JournalProjection {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      admins: this.admins.toProjection(),
      members: this.members.toProjection(),
    };
  }
}
