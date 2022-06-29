import { AbstractModel } from "../shared";
import RecordTypeValue from "./record-type.value";
import RecordItemValue from "./record-item.value";

export default interface RecordModel extends AbstractModel {
  readonly journal: string;
  readonly name: string;
  readonly description: string;
  readonly type: RecordTypeValue;
  readonly timestamp: Date;
  readonly tags: string[];
  readonly items: RecordItemValue[];
  readonly isValid: boolean;
}
