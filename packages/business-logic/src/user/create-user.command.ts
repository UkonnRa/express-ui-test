import { Command, RoleValue } from "../shared";

export default interface CreateUserCommand extends Command {
  readonly type: "CreateUserCommand";

  readonly name: string;
  readonly role?: RoleValue;
  readonly authIds?: Record<string, string>;
}
