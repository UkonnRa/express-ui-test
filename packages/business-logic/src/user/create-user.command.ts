import UserCommand from "./user.command";
import RoleValue from "./role.value";
import AuthIdValue from "./auth-id.value";

export default interface CreateUserCommand extends UserCommand {
  readonly type: "CreateUserCommand";

  readonly name: string;
  readonly role?: RoleValue;
  readonly authIds?: AuthIdValue[];
}
