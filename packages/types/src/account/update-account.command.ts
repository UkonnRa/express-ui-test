import { Command } from "../shared";
import AccountTypeValue from "./account-type.value";
import AccountStrategyValue from "./account-strategy.value";

export default interface UpdateAccountCommand extends Command {
  readonly type: "UpdateAccountCommand";

  readonly targetId: string;
  readonly name?: string;
  readonly description?: string;
  readonly accountType?: AccountTypeValue;
  readonly strategy?: AccountStrategyValue;
  readonly unit?: string;
}
