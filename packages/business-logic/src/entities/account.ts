import { Cascade, Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import AbstractEntity from './abstract-entity';
import { Journal } from './journal';

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

@Entity()
export class Account extends AbstractEntity<Account> {
  @Property()
  readonly name: string;

  @ManyToOne(() => Journal, { cascade: [Cascade.ALL] })
  readonly journal: Journal;

  @Enum()
  readonly type: AccountType;

  @Property()
  readonly unit: string;

  @Enum()
  readonly strategy: Strategy;

  @Property()
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
}
