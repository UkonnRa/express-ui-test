import type { QueryFullTextValue } from "./index";

export type UserQueryFullText = QueryFullTextValue & {
  readonly type: "UserQueryFullText";
};

export type UserQuery = UserQueryFullText;
