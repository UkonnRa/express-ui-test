import { Command } from "../shared";

export default interface CreateGroupCommand extends Command {
  readonly type: "CreateGroupCommand";

  readonly name: string;
  readonly description: string;
  readonly admins: string[];
  readonly members: string[];
}
