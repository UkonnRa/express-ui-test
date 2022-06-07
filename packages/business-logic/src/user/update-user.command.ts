import RoleValue from "./role.value";
import AuthIdValue from "./auth-id.value";
import { Command } from "../shared";

export default interface UpdateUserCommand extends Command {
  readonly type: "UpdateUserCommand";
  readonly targetId: string;

  readonly name?: string;
  readonly role?: RoleValue;
  readonly authIds?: AuthIdValue[];
}
