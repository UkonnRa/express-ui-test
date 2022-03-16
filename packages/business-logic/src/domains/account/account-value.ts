import { AccountType, Strategy } from "./account";

export interface AccountValue {
  readonly id: string;
  readonly name: string[];
  readonly description: string;
  readonly journal: string;
  readonly accountType: AccountType;
  readonly unit: string;
  readonly strategy: Strategy;
}
