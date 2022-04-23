import type { PageResult, JournalValue } from "@white-rabbit/type-bridge";

export const JOURNAL_API_KEY = Symbol("JournalApi");

export interface JournalApi {
  findAll(
    keyword?: string,
    includeArchived?: boolean,
    fromDate?: Date,
    endDate?: Date
  ): Promise<PageResult<JournalValue>>;
}
