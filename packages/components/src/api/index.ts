import type { PageResult, QueryType } from "@white-rabbit/type-bridge";

export * from "./AccessItemApi";

export interface ReadApi<V, Q> {
  findById(id: string): Promise<V | undefined>;
  findAll(query: QueryType<Q>): Promise<PageResult<V>>;
}

export interface WriteApi<C> {
  handle(command: C): Promise<string>;
}
