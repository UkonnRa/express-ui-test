import { ObjectQuery } from "@mikro-orm/core";
import AdditionalQuery from "./additional-query";

export { AdditionalQuery };
export { default as FullTextQuery } from "./full-text.query";

export type Query<E> = ObjectQuery<E> & {
  $additional?: AdditionalQuery[];
};
