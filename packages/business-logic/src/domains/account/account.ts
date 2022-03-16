import AbstractEntity from "../../shared/abstract-entity";
import { Journal } from "../journal";
import { User } from "../user";
import { AccountValue } from ".";

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

export interface AccountCreateOptions {
  name: string[];
  description: string;
  journal: Journal;
  accountType: AccountType;
  unit: string;
  strategy: Strategy;
}

const MIN_LENGTH_NAME = 2;

const MAX_LENGTH_NAME = 10;

const MIN_LENGTH_NAME_EACH = 6;

const MAX_LENGTH_NAME_EACH = 50;

const MAX_LENGTH_DESCRIPTION = 400;

const MIN_LENGTH_UNIT = 1;

const MAX_LENGTH_UNIT = 20;

const NAME_SEPARATOR = "::";

export const TYPE = "Account";

export class Account extends AbstractEntity<
  Account,
  AccountValue,
  typeof TYPE
> {
  #name: string[];

  #description: string;

  journal: Journal;

  accountType: AccountType;

  #unit: string;

  strategy: Strategy;

  get entityType(): typeof TYPE {
    return TYPE;
  }

  constructor({
    name,
    description,
    journal,
    accountType,
    unit,
    strategy,
  }: AccountCreateOptions) {
    super();
    this.name = name;
    this.description = description;
    this.journal = journal;
    this.accountType = accountType;
    this.unit = unit;
    this.strategy = strategy;
  }

  get nameValue(): string {
    return this.name.join(NAME_SEPARATOR);
  }

  get name(): string[] {
    return this.#name;
  }

  set name(value: string[]) {
    this.checkLength(value.length, "name", {
      min: MIN_LENGTH_NAME,
      max: MAX_LENGTH_NAME,
    });
    this.#name = [];
    for (const v of value) {
      const result = v.trim();
      this.checkLength(result.length, "name.each", {
        min: MIN_LENGTH_NAME_EACH,
        max: MAX_LENGTH_NAME_EACH,
      });
      this.#name.push(result);
    }
  }

  get description(): string {
    return this.#description;
  }

  set description(value: string) {
    const result = value.trim();
    this.checkLength(result.length, "description", {
      max: MAX_LENGTH_DESCRIPTION,
    });
    this.#description = result;
  }

  get unit(): string {
    return this.#unit;
  }

  set unit(value: string) {
    const result = value.trim();
    this.checkLength(result.length, "unit", {
      min: MIN_LENGTH_UNIT,
      max: MAX_LENGTH_UNIT,
    });
    this.#unit = result;
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
