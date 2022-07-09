import { FULL_TEXT_OPERATOR, RoleValue } from "../shared";

export default interface UserQuery {
  readonly id?: string | string[];
  // default is full matching ($eq), not full text
  readonly name?: string | { [FULL_TEXT_OPERATOR]: string };
  readonly role?: RoleValue;
  readonly authId?: Record<string, string>;
}
