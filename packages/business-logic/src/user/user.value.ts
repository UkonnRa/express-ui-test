import RoleValue from "./role.value";
import AuthIdValue from "./auth-id.value";

export default interface UserValue {
  readonly id: string;
  readonly name: string;
  readonly role: RoleValue;
  readonly authIds: AuthIdValue[];
}
