import AuthUser from "./auth-user";

export default interface CommandsInput<C> {
  readonly authUser: AuthUser;
  readonly commands: C[];
}
