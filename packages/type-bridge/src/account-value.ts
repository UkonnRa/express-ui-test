export const TYPE_ACCOUNT = Symbol("Account");

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

export interface AccountValue {
  readonly id: string;
  readonly name: string[];
  readonly description: string;
  readonly journal: string;
  readonly accountType: AccountType;
  readonly unit: string;
  readonly strategy: Strategy;
}
