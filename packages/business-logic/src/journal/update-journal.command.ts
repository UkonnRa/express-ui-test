import { Command } from "../shared";
import AccessItemInput from "./access-item.input";

export default interface UpdateJournalCommand extends Command {
  readonly type: "UpdateJournalCommand";

  readonly targetId: string;
  readonly name?: string;
  readonly description?: string;
  readonly tags?: string[];
  readonly unit?: string;
  readonly admins?: AccessItemInput[];
  readonly members?: AccessItemInput[];
}
