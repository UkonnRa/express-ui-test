import CreateAccountCommand from "./create-account.command";
import UpdateAccountCommand from "./update-account.command";
import DeleteAccountCommand from "./delete-account.command";

type AccountCommand =
  | CreateAccountCommand
  | UpdateAccountCommand
  | DeleteAccountCommand;

export default AccountCommand;
