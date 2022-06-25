import { Command } from "../shared";
import RecordTypeValue from "./record-type.value";
import RecordItemValue from "./record-item.value";

export default interface UpdateRecordCommand extends Command {
  readonly type: "UpdateRecordCommand";

  readonly targetId: string;
  readonly name?: string;
  readonly description?: string;
  readonly recordType?: RecordTypeValue;
  readonly timestamp?: Date;
  readonly tags?: string[];
  readonly items?: RecordItemValue[];
}
