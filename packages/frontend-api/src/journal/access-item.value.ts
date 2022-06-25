import AccessItemTypeValue from "./access-item-type.value";

export default interface AccessItemValue {
  readonly type: AccessItemTypeValue;
  readonly id: string;
}
