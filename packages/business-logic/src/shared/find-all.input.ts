import { AbstractEntity, AuthUser, Pagination, Sort } from "./index";
import { ObjectQuery } from "@mikro-orm/core";
import AdditionalQuery from "./additional-query";

export default interface FindAllInput<E extends AbstractEntity<E>> {
  readonly authUser?: AuthUser;
  readonly query?: ObjectQuery<E> & {
    $additional?: AdditionalQuery[];
  };
  readonly pagination: Pagination;
  readonly sort: Sort[];
}
