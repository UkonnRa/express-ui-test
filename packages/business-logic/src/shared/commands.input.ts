import {
  Command,
  CommandsInput as OriginalCommandsInput,
} from "@white-rabbit/types";
import AuthUser from "./auth-user";

export default interface CommandsInput<C extends Command>
  extends OriginalCommandsInput<C> {
  readonly authUser: AuthUser;
}
