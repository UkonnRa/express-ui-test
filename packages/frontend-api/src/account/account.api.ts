import { AccountCommand, AccountQuery } from "@white-rabbit/types";
import AbstractApi from "../abstract-api";
import AccountModel from "./account.model";

export default interface AccountApi<T = unknown>
  extends AbstractApi<T, AccountModel, AccountCommand, AccountQuery> {}
