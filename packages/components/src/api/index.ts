export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface PageResult<V> {
  pageInfo: PageInfo;
  pageItems: Array<{ cursor: string; data: V }>;
}

export * from "./JournalViewApi";
