import { QueryFullTextValue } from "@white-rabbit/type-bridge";

export type UserQueryFullText = QueryFullTextValue & {
  readonly type: "UserQueryFullText";
};

export type UserQuery = UserQueryFullText;
