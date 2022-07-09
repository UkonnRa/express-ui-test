import { RecordItemValue, RecordTypeValue } from "@white-rabbit/types";
import { AbstractModel } from "../shared";

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
