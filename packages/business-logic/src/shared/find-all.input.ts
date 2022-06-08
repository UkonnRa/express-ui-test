import { AbstractEntity, AuthUser, Pagination, Sort } from "./index";
import { Query } from "./query";

export default interface FindAllInput<E extends AbstractEntity<E>> {
  readonly authUser: AuthUser;
  readonly query?: Query<E>;
  readonly pagination: Pagination;
  readonly sort: Sort[];
}
