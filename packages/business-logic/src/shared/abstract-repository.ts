import AbstractEntity from './abstract-entity';

export type AdditionalFilter<T extends AbstractEntity<T, unknown>> = (entity: T[]) => Promise<T[]>;

export default interface AbstractRepository<T extends AbstractEntity<T, V>, V, Q> {
  doCompare(a: T, b: T, field: string): number;
  doQuery(entity: T, query?: Q): boolean;
  doConvertAdditionalQuery(query?: Q): AdditionalFilter<T>[];

  findById(id: string): Promise<T | undefined>;
  findByIds(ids: string[]): Promise<T[]>;
  findAll(
    sort: Sort,
    pagination: Pagination,
    query?: Q,
    additionalFilters?: AdditionalFilter<T>[],
  ): Promise<PageResult<V>>;

  save(entity: T): Promise<void>;

  close(): void;
}

export type Sort = { field: string; order: 'ASC' | 'DESC' }[];

export type Pagination = {
  size: number;
  startFrom: 'FIRST' | 'LAST';
  after?: string;
  before?: string;
};

export interface PageResult<V> {
  pageInfo: PageInfo;
  pageItems: { cursor: string; data: V }[];
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}
