import { AbstractEntity, AuthUser, Pagination, Sort } from "./index";
import { ObjectQuery } from "@mikro-orm/core";

export default interface FindAllInput<E extends AbstractEntity<E>> {
  readonly authUser?: AuthUser;
  readonly query?: ObjectQuery<E>;
  readonly pagination: Pagination;
  readonly sort: Sort[];
}
