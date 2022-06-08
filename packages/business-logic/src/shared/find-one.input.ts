import AbstractEntity from "./abstract-entity";
import AuthUser from "./auth-user";
import { Query } from "./query";

export default interface FindOneInput<E extends AbstractEntity<E>> {
  readonly authUser: AuthUser;
  readonly query?: Query<E>;
}
