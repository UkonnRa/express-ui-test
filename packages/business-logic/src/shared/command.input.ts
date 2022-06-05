import AuthUser from "./auth-user";

export default interface CommandInput<C> {
  readonly authUser: AuthUser;
  readonly command: C;
}
