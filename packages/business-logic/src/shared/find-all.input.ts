import { Query } from "./query";
import AbstractEntity from "./abstract-entity";
import AuthUser from "./auth-user";

export default interface FindAllInput<E extends AbstractEntity<E>> {
  readonly authUser: AuthUser;
  query?: Query<E>;
}
