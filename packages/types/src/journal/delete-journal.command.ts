import { Command } from "../shared";

export default interface DeleteJournalCommand extends Command {
  readonly type: "DeleteJournalCommand";

  readonly targetId: string;
}
