import { Command } from "../shared";
import AccessItemValue from "./access-item.value";

export default interface UpdateJournalCommand extends Command {
  readonly type: "UpdateJournalCommand";

  readonly targetId: string;
  readonly name?: string;
  readonly description?: string;
  readonly tags?: string[];
  readonly unit?: string;
  readonly admins?: AccessItemValue[];
  readonly members?: AccessItemValue[];
}
