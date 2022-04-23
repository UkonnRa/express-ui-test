import { PageResult, Pagination, Sort } from "@white-rabbit/type-bridge";
import type AbstractEntity from "./abstract-entity";

export type AdditionalFilter<T extends AbstractEntity<T, unknown>> = (
  entity: T[]
) => Promise<T[]>;

export interface AbstractRepository<T extends AbstractEntity<T, V>, V, Q> {
  doCompare: (a: T, b: T, field: string) => number;
  doQuery: (entity: T, query?: Q) => boolean;
  doConvertAdditionalQuery: (query?: Q) => Array<AdditionalFilter<T>>;

  findById: (id: string) => Promise<T | undefined>;
  findByIds: (ids: string[]) => Promise<Map<string, T>>;
  findOne: (
    query: Q,
    sort?: Sort,
    additionalFilters?: Array<AdditionalFilter<T>>
  ) => Promise<V | undefined>;
  findAll: (
    sort: Sort,
    pagination: Pagination,
    query?: Q,
    additionalFilters?: Array<AdditionalFilter<T>>
  ) => Promise<PageResult<V>>;

  save: (entity: T) => Promise<void>;

  saveAll: (entity: T[]) => Promise<void>;

  close: () => void;
}
