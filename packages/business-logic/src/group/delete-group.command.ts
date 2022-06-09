import { Command } from "../shared";

export default interface DeleteGroupCommand extends Command {
  readonly type: "DeleteGroupCommand";

  readonly targetId: string;
}
