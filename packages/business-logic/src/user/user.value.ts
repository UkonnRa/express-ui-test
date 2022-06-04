import { AuthIdValue, RoleValue } from "@/user";

export default interface UserValue {
  readonly name: string;
  readonly role: RoleValue;
  readonly authIds: AuthIdValue[];
}
