import AbstractEntity from './abstract-entity';

export default interface AbstractRepository<T extends AbstractEntity<T, unknown>, Q> {
  findById(id: string): Promise<T | undefined>;
  findByIds(ids: string[]): Promise<T[]>;
  findAll(sort: Sort, pagination: Pagination, query?: Q): Promise<T[]>;

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

export interface PageResult<P> {
  pageInfo: PageInfo;
  pageItems: { cursor: string; data: P }[];
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}
