import { Command } from "../shared";

export default interface GroupCommand extends Command {
  readonly type:
    | "CreateGroupCommand"
    | "UpdateGroupCommand"
    | "DeleteGroupCommand";
}
