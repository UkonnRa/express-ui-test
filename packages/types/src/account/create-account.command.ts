import { Command } from "../shared";
import AccountTypeValue from "./account-type.value";
import AccountStrategyValue from "./account-strategy.value";

export default interface CreateAccountCommand extends Command {
  readonly type: "CreateAccountCommand";

  readonly journal: string;
  readonly name: string;
  readonly description: string;
  readonly accountType: AccountTypeValue;
  readonly strategy: AccountStrategyValue;
  readonly unit: string;
}
