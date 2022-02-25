import AbstractEntity from '../../shared/abstract-entity';
import { Journal } from '../journal';
import { FieldValidationLengthError } from '../../shared/errors';
import { User } from '../user';
import { AccountValue } from '.';

export enum Strategy {
  FIFO,
  AVERAGE,
}

export enum AccountType {
  ASSET,
  LIABILITY,
  INCOME,
  EXPENSE,
  EQUITY,
}

export type AccountCreateOptions = {
  name: string[];
  description: string;
  journal: Journal;
  accountType: AccountType;
  unit: string;
  strategy: Strategy;
};

const MIN_LENGTH_NAME = 2;

const MAX_LENGTH_NAME = 10;

const MIN_LENGTH_NAME_EACH = 6;

const MAX_LENGTH_NAME_EACH = 50;

const MAX_LENGTH_DESCRIPTION = 400;

const NAME_SEPERATOR = '::';

export class Account extends AbstractEntity<Account, AccountValue> {
  #name: string[];

  #description: string;

  journal: Journal;

  accountType: AccountType;

  unit: string;

  strategy: Strategy;

  constructor({ name, description, journal, accountType, unit, strategy }: AccountCreateOptions) {
    super();
    this.name = name;
    this.description = description;
    this.journal = journal;
    this.accountType = accountType;
    this.unit = unit;
    this.strategy = strategy;
  }

  get nameValue(): string {
    return this.name.join(NAME_SEPERATOR);
  }

  get name(): string[] {
    return this.#name;
  }

  set name(value: string[]) {
    if (value.length < MIN_LENGTH_NAME || value.length > MAX_LENGTH_NAME) {
      throw new FieldValidationLengthError('Journal', 'name', MIN_LENGTH_NAME, MAX_LENGTH_NAME);
    }

    this.#name = [];
    for (const v of value) {
      const result = v.trim();
      if (result.length < MIN_LENGTH_NAME_EACH || result.length > MAX_LENGTH_NAME_EACH) {
        throw new FieldValidationLengthError('Journal', 'name.each', MIN_LENGTH_NAME_EACH, MAX_LENGTH_NAME_EACH);
      }
      this.#name.push(result);
    }
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
    return this.journal.isReadable(user);
  }

  isWritable(user: User): boolean {
    return this.journal.isWritable(user);
  }

  toValue(): AccountValue {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      journal: this.journal.id,
      accountType: this.accountType,
      unit: this.unit,
      strategy: this.strategy,
    };
  }
}
