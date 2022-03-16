import { AccountType, Strategy } from "./account";

export interface AccountCommandCreate {
  readonly type: "AccountCommandCreate";

  readonly name: string[];

  readonly description: string;

  readonly journal: string;

  readonly accountType: AccountType;

  readonly unit: string;

  readonly strategy: Strategy;
}

export interface AccountCommandUpdate {
  readonly type: "AccountCommandCreate";

  readonly id: string;

  readonly name?: string[];

  readonly description?: string;

  readonly accountType?: AccountType;

  readonly unit?: string;

  readonly strategy?: Strategy;
}

export interface AccountCommandDelete {
  readonly type: "AccountCommandCreate";

  readonly id: string;
}

export type AccountCommand = AccountCommandCreate | AccountCommandUpdate;
