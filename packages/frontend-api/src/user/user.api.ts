import AbstractApi from "../abstract-api";
import UserModel from "./user.model";
import UserCommand from "./user.command";

export default interface UserApi extends AbstractApi<UserModel, UserCommand> {}
