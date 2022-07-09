import { AccountStrategyValue, AccountTypeValue } from "@white-rabbit/types";
import { AbstractModel } from "../shared";

export default interface AccountModel extends AbstractModel {
  readonly journal: string;
  readonly name: string;
  readonly description: string;
  readonly type: AccountTypeValue;
  readonly strategy: AccountStrategyValue;
  readonly unit: string;
  readonly archived: boolean;
}
