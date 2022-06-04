import { AuthUser } from "./index";

export default interface CommandInput<C> {
  readonly authUser: AuthUser;
  readonly command: C;
}
