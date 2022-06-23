import { Command } from "../shared";

export default interface DeleteRecordCommand extends Command {
  readonly type: "DeleteRecordCommand";

  readonly targetId: string;
}
