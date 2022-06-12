import { Command, RoleValue } from "../shared";
import AuthIdValue from "./auth-id.value";

export default interface CreateUserCommand extends Command {
  readonly type: "CreateUserCommand";

  readonly name: string;
  readonly role?: RoleValue;
  readonly authIds?: AuthIdValue[];
}
