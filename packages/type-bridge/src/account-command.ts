import type { AccountType, Strategy } from "./account-value";

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
  readonly type: "AccountCommandUpdate";

  readonly id: string;

  readonly name?: string[];

  readonly description?: string;

  readonly accountType?: AccountType;

  readonly unit?: string;

  readonly strategy?: Strategy;
}

export interface AccountCommandDelete {
  readonly type: "AccountCommandDelete";

  readonly id: string;
}

export type AccountCommand =
  | AccountCommandCreate
  | AccountCommandUpdate
  | AccountCommandDelete;
