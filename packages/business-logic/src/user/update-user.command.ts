import RoleValue from "./role.value";
import AuthIdValue from "./auth-id.value";
import UserCommand from "./user.command";

export default interface UpdateUserCommand extends UserCommand {
  readonly type: "UpdateUserCommand";
  readonly targetId: string;

  readonly name?: string;
  readonly role?: RoleValue;
  readonly authIds?: AuthIdValue[];
}
