import { Command, RoleValue } from "../shared";
import AuthIdValue from "./auth-id.value";

export default interface UpdateUserCommand extends Command {
  readonly type: "UpdateUserCommand";
  readonly targetId: string;

  readonly name?: string;
  readonly role?: RoleValue;
  readonly authIds?: AuthIdValue[];
}
