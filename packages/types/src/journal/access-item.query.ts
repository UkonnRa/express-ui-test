import { CONTAINING_USER_OPERATOR, FULL_TEXT_OPERATOR } from "../shared";
import AccessItemTypeValue from "./access-item-type.value";

export default interface AccessItemQuery {
  readonly [FULL_TEXT_OPERATOR]?: string;
  readonly [CONTAINING_USER_OPERATOR]?: string;
  readonly type?: AccessItemTypeValue;
}
