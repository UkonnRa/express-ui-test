import { Command } from "../shared";
import RoleValue from "./role.value";

export default interface UpdateUserCommand extends Command {
  readonly type: "UpdateUserCommand";
  readonly targetId: string;

  readonly name?: string;
  readonly role?: RoleValue;
  readonly authIds?: Record<string, string>;
}
