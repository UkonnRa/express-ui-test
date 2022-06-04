import { AbstractEntity, AuthUser, Pagination, Sort } from "./index";
import { FilterQuery } from "@mikro-orm/core";

export default interface FindAllInput<E extends AbstractEntity<E>> {
  readonly authUser?: AuthUser;
  readonly query?: FilterQuery<E>;
  readonly pagination: Pagination;
  readonly sort: Sort[];
}
