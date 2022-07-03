import AbstractApi from "../abstract-api";
import UserModel from "./user.model";
import UserCommand from "./user.command";

export default interface UserApi<T = unknown>
  extends AbstractApi<T, UserModel, UserCommand> {}
