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

export interface AccessList {
  readonly items: Array<AccessItem>;
}

export interface AccessItem {
  readonly type: "USER" | "GROUP";
  readonly id: string;
  readonly name: string;
}

export interface Journal {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly admins: AccessList;
  readonly members: AccessList;
}

export interface JournalViewApi {
  findAll(
    keyword?: string,
    includeDeactivated?: boolean
  ): Promise<PageResult<Journal>>;
}
