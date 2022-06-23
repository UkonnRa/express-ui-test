import { ObjectQuery } from "@mikro-orm/core";
import AdditionalQuery from "./additional-query";

export { AdditionalQuery };
export { default as ContainingUserQuery } from "./containing-user.query";
export { default as FullTextQuery } from "./full-text.query";
export { default as IsReadableQuery } from "./is-readable.query";

export type Query<E> = ObjectQuery<E> & {
  $additional?: AdditionalQuery[];
};
