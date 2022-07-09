import AbstractEntity from "./abstract-entity";
import AuthUser from "./auth-user";

export default interface FindAllInput<E extends AbstractEntity<E>, Q> {
  readonly authUser: AuthUser;
  query?: Q;
}
