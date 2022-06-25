import { Command } from "../shared";
import AccessItemValue from "./access-item.value";

export default interface CreateJournalCommand extends Command {
  readonly type: "CreateJournalCommand";

  readonly name: string;
  readonly description: string;
  readonly tags: string[];
  readonly unit: string;
  readonly admins: AccessItemValue[];
  readonly members: AccessItemValue[];
}
