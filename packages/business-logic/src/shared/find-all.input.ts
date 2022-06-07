import { AbstractEntity, AuthUser, Pagination, Sort } from "./index";
import { ObjectQuery } from "@mikro-orm/core";

export interface AdditionalQuery {
  type: "Fulltext";
  value: string;
  fields: string[];
}

export default interface FindAllInput<E extends AbstractEntity<E>> {
  readonly authUser?: AuthUser;
  readonly query?: ObjectQuery<E> & {
    $additional?: AdditionalQuery[];
  };
  readonly pagination: Pagination;
  readonly sort: Sort[];
}
