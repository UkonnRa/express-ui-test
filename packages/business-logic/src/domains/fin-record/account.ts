import AbstractEntity from '../../shared/abstract-entity';
import { Journal } from '../journal';

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
  name: string;
  journal: Journal;
  type: AccountType;
  unit: string;
  strategy: Strategy;
  activated: boolean;
};

export class Account extends AbstractEntity<Account, unknown> {
  readonly name: string;

  readonly journal: Journal;

  readonly type: AccountType;

  readonly unit: string;

  readonly strategy: Strategy;

  readonly activated: boolean;

  constructor({ name, journal, type, unit, strategy, activated }: AccountCreateOptions) {
    super();
    this.name = name;
    this.journal = journal;
    this.type = type;
    this.unit = unit;
    this.strategy = strategy;
    this.activated = activated;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isReadable(): boolean {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isWritable(): boolean {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toValue(): never {
    throw new Error('Method not implemented.');
  }
}
