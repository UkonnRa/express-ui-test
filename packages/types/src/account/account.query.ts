import { FULL_TEXT_OPERATOR } from "../shared";
import AccountTypeValue from "./account-type.value";
import AccountStrategyValue from "./account-strategy.value";

export default interface AccountQuery {
  readonly [FULL_TEXT_OPERATOR]?: string;
  readonly id?: string | string[];
  readonly journal?: string;
  readonly name?: string | { [FULL_TEXT_OPERATOR]: string };
  readonly description?: string;
  readonly type?: AccountTypeValue;
  readonly strategy?: AccountStrategyValue;
  readonly unit?: string;
  readonly includeArchived?: boolean;
}
