import AuthUser from "./auth-user";
import Command from "./command";

export default interface CommandsInput<C extends Command> {
  readonly authUser: AuthUser;
  readonly commands: C[];
}
