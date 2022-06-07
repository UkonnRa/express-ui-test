import RoleValue from "./role.value";
import AuthIdValue from "./auth-id.value";
import { Command } from "../shared";

export default interface CreateUserCommand extends Command {
  readonly type: "CreateUserCommand";

  readonly name: string;
  readonly role?: RoleValue;
  readonly authIds?: AuthIdValue[];
}
