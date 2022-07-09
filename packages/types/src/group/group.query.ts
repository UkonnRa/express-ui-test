import { CONTAINING_USER_OPERATOR, FULL_TEXT_OPERATOR } from "../shared";

export default interface GroupQuery {
  readonly [FULL_TEXT_OPERATOR]?: string;
  readonly [CONTAINING_USER_OPERATOR]?: string;
  readonly id?: string | string[];
  // default is full matching, not full text
  readonly name?: string | { [FULL_TEXT_OPERATOR]: string };
  readonly description?: string;
  readonly admins?: string | string[];
  readonly members?: string | string[];
}
