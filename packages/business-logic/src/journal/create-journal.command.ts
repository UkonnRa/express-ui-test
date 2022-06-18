import { Command } from "../shared";
import AccessItemInput from "./access-item.input";

export default interface CreateJournalCommand extends Command {
  readonly type: "CreateJournalCommand";

  readonly name: string;
  readonly description: string;
  readonly tags: string[];
  readonly unit: string;
  readonly admins: AccessItemInput[];
  readonly members: AccessItemInput[];
}
