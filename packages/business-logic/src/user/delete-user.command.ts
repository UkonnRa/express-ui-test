import { Command } from "../shared";

export default interface DeleteUserCommand extends Command {
  readonly type: "DeleteUserCommand";
  readonly targetId: string;
}
