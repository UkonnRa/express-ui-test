import { AuthIdValue, RoleValue, UserCommand } from "./index";

export default interface CreateUserCommand extends UserCommand {
  readonly type: "CreateUserCommand";

  readonly name: string;
  readonly role?: RoleValue;
  readonly authIds?: AuthIdValue[];
}
