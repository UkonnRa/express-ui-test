import AbstractEntity from "./abstract-entity";
import AuthUser from "./auth-user";

export default interface FindOneInput<E extends AbstractEntity<E>, Q> {
  readonly authUser: AuthUser;
  readonly query?: Q;
}
