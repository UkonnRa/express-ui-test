import { UserCommand } from "./index";

export default interface DeleteUserCommand extends UserCommand {
  readonly type: "DeleteUserCommand";
  readonly targetId: string;
}
