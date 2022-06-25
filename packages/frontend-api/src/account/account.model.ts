import { AbstractModel } from "../shared";
import AccountTypeValue from "./account-type.value";
import AccountStrategyValue from "./account-strategy.value";

export default interface AccountModel extends AbstractModel {
  readonly journal: string;
  readonly name: string;
  readonly description: string;
  readonly type: AccountTypeValue;
  readonly strategy: AccountStrategyValue;
  readonly unit: string;
  readonly archived: boolean;
}
