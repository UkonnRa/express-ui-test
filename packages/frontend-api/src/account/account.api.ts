import AbstractApi from "../abstract-api";
import AccountModel from "./account.model";
import AccountCommand from "./account.command";

export default interface AccountApi
  extends AbstractApi<AccountModel, AccountCommand> {}
