import {
  Command,
  CommandInput as OriginCommandInput,
} from "@white-rabbit/types";
import AuthUser from "./auth-user";

export default interface CommandInput<C extends Command>
  extends OriginCommandInput<C> {
  readonly authUser: AuthUser;
}
