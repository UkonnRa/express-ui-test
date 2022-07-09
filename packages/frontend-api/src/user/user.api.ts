import { UserCommand, UserQuery } from "@white-rabbit/types";
import AbstractApi from "../abstract-api";
import UserModel from "./user.model";

export default interface UserApi<T = unknown>
  extends AbstractApi<T, UserModel, UserCommand, UserQuery> {}
