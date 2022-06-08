import { ObjectQuery } from "@mikro-orm/core";
import AdditionalQuery from "./additional-query";

export { AdditionalQuery };
export { default as FullTextQuery } from "./full-text.query";
export { default as IncludeDeletedQuery } from "./include-deleted.query";

export type Query<E> = ObjectQuery<E> & {
  $additional?: AdditionalQuery[];
};
