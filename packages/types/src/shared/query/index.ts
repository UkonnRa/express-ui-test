import ReadableQuery from "./readable.query";
import FullTextQuery, { FULL_TEXT_OPERATOR } from "./full-text.query";
import ContainingUserQuery, {
  CONTAINING_USER_OPERATOR,
} from "./containing-user.query";

export {
  type ReadableQuery,
  type FullTextQuery,
  FULL_TEXT_OPERATOR,
  type ContainingUserQuery,
  CONTAINING_USER_OPERATOR,
};

export type AdditionalQuery =
  | FullTextQuery
  | ContainingUserQuery
  | ReadableQuery;
