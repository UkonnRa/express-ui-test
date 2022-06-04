import { Command } from "../shared";

export default interface UserCommand extends Command {
  readonly type:
    | "CreateUserCommand"
    | "UpdateUserCommand"
    | "DeleteUserCommand";
}
