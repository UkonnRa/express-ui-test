import AccessItemTypeValue from "./access-item-type.value";

export default interface AccessItemInput {
  readonly type: AccessItemTypeValue;
  readonly id: string;
}
