import type {
  PageResult,
  QueryType,
  AccessItemQuery,
  AccessItemValue,
  JournalValue,
  JournalQuery,
  JournalCommand,
} from "@white-rabbit/type-bridge";

export interface ReadApi<V, Q> {
  findById(id: string): Promise<V | undefined>;
  findAll(query: QueryType<Q>): Promise<PageResult<V>>;
}

export interface WriteApi<C> {
  handle(command: C): Promise<string>;
}

export type AccessItemApi = ReadApi<AccessItemValue, AccessItemQuery>;

export const ACCESS_ITEM_API_KEY = Symbol("ACCESS_ITEM_API_KEY");

export type JournalApi = ReadApi<JournalValue, JournalQuery> &
  WriteApi<JournalCommand>;

export const JOURNAL_API_KEY = Symbol("JOURNAL_API_KEY");
