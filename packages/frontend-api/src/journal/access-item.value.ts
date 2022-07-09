import { AccessItemTypeValue } from "@white-rabbit/types";

export default interface AccessItemValue {
  readonly type: AccessItemTypeValue;
  readonly id: string;
  readonly name: string;
}
