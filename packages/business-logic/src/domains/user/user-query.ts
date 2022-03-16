import { QueryFullTextValue } from "../../shared/abstract-repository";

export type UserQueryFullText = QueryFullTextValue & {
  readonly type: "UserQueryFullText";
};

export type UserQuery = UserQueryFullText;
