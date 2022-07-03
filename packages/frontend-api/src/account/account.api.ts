import AbstractApi from "../abstract-api";
import AccountModel from "./account.model";
import AccountCommand from "./account.command";

export default interface AccountApi<T = unknown>
  extends AbstractApi<T, AccountModel, AccountCommand> {}
