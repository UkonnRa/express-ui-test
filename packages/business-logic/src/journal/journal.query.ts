import { CONTAINING_USER_OPERATOR, FULL_TEXT_OPERATOR } from "../shared";
import AccessItemInput from "./access-item.input";

export default interface JournalQuery {
  readonly [FULL_TEXT_OPERATOR]?: string;
  readonly [CONTAINING_USER_OPERATOR]?: string;
  readonly id?: string | string[];
  readonly name?: string | { [FULL_TEXT_OPERATOR]: string };
  readonly description?: string;
  readonly tags?: string | string[] | { [FULL_TEXT_OPERATOR]: string };
  readonly unit?: string;
  readonly includeArchived?: boolean;
  readonly admins?: AccessItemInput;
  readonly members?: AccessItemInput;
}
