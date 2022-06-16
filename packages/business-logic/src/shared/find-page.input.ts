import { Query } from "./query";
import AbstractEntity from "./abstract-entity";
import AuthUser from "./auth-user";
import Pagination from "./pagination";
import Sort from "./sort";

export default interface FindPageInput<E extends AbstractEntity<E>> {
  readonly authUser: AuthUser;
  query?: Query<E>;
  readonly pagination: Pagination;
  readonly sort: Sort[];
}
