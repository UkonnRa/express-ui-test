export * from "./access-item-query";
export * from "./account-command";
export * from "./account-query";
export * from "./account-value";
export * from "./fin-record-command";
export * from "./fin-record-query";
export * from "./fin-record-value";
export * from "./group-command";
export * from "./group-query";
export * from "./group-value";
export * from "./journal-command";
export * from "./journal-query";
export * from "./journal-value";
export * from "./user-command";
export * from "./user-query";
export * from "./user-value";

export type Sort = Array<{ field: string; order: "ASC" | "DESC" }>;

export interface Pagination {
  size: number;
  startFrom: "FIRST" | "LAST";
  after?: string;
  before?: string;
}

export interface QueryType<Q> {
  sort: Sort;
  pagination: Pagination;
  query?: Q;
}

export interface PageResult<V> {
  pageInfo: PageInfo;
  pageItems: Array<{ cursor: string; data: V }>;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface KeywordValue {
  fields?: string[];
  value: string;
}

export interface QueryFullTextValue {
  readonly keyword: KeywordValue;
}

export type UpdateNullableValue<V> =
  | { type: "UNSET" }
  | { type: "SET"; value: V };
