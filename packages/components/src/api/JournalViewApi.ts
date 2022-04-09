import type { PageResult } from "./index";

export interface AccessItem {
  readonly type: "User" | "Group";
  readonly id: string;
  readonly name: string;
}

export interface Journal {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly admins: Array<AccessItem>;
  readonly members: Array<AccessItem>;
}

export interface JournalViewApi {
  findAll(
    keyword?: string,
    includeDeactivated?: boolean
  ): Promise<PageResult<Journal>>;
}
