import { AccountType, Strategy } from './account';

export type AccountCommandCreate = {
  readonly type: 'AccountCommandCreate';

  readonly name: string[];

  readonly description: string;

  readonly journal: string;

  readonly accountType: AccountType;

  readonly unit: string;

  readonly strategy: Strategy;
};

export type AccountCommandUpdate = {
  readonly type: 'AccountCommandCreate';

  readonly id: string;

  readonly name?: string[];

  readonly description?: string;

  readonly accountType?: AccountType;

  readonly unit?: string;

  readonly strategy?: Strategy;
};

export type AccountCommandDelete = {
  readonly type: 'AccountCommandCreate';

  readonly id: string;
};

export type AccountCommand = AccountCommandCreate | AccountCommandUpdate;
