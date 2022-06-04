import { AuthIdValue, RoleValue, UserCommand } from "./index";

export default interface UpdateUserCommand extends UserCommand {
  readonly type: "UpdateUserCommand";
  readonly targetId: string;

  readonly name?: string;
  readonly role?: RoleValue;
  readonly authIds?: AuthIdValue[];
}
