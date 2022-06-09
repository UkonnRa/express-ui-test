import { Command } from "../shared";

export default interface UpdateGroupCommand extends Command {
  readonly type: "UpdateGroupCommand";

  readonly targetId: string;
  readonly name?: string;
  readonly description?: string;
  readonly admins?: string[];
  readonly members?: string[];
}
