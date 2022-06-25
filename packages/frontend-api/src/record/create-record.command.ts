import { Command } from "../shared";
import RecordTypeValue from "./record-type.value";
import RecordItemValue from "./record-item.value";

export default interface CreateRecordCommand extends Command {
  readonly type: "CreateRecordCommand";

  readonly journal: string;
  readonly name: string;
  readonly description: string;
  readonly recordType: RecordTypeValue;
  readonly timestamp: Date;
  readonly tags: Set<string>;
  readonly items: RecordItemValue[];
}
