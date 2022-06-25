import { Command } from "../shared";
import RoleValue from "./role.value";

export default interface CreateUserCommand extends Command {
  readonly type: "CreateUserCommand";

  readonly name: string;
  readonly role?: RoleValue;
  readonly authIds?: Record<string, string>;
}
