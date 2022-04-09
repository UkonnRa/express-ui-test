import {
  AbstractRepository,
  AdditionalFilter,
  PageResult,
  Pagination,
  Sort,
  AbstractEntity,
  cursorToId,
} from "@white-rabbit/business-logic";

async function filtersAllMatching<
  T extends AbstractEntity<T, unknown, unknown>
>(entities: T[], additionalFilters: Array<AdditionalFilter<T>>): Promise<T[]> {
  let result = [...entities];

  for (const f of additionalFilters) {
    // eslint-disable-next-line no-await-in-loop
    result = await f(result);
  }

  return result;
}

export default abstract class MemoryRepository<
  T extends AbstractEntity<T, V, unknown>,
  V,
  Q
> implements AbstractRepository<T, V, Q>
{
  protected readonly data: Map<string, T> = new Map();

  abstract doCompare(a: T, b: T, field: string): number;

  abstract doQuery(entity: T, query?: Q): boolean;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  doConvertAdditionalQuery(_?: Q): Array<AdditionalFilter<T>> {
    return [];
  }

  close(): void {
    this.data.clear();
  }

  async findById(id: string): Promise<T | undefined> {
    const result = this.data.get(id);
    return result?.deleted === true ? undefined : result;
  }

  async findByIds(ids: string[]): Promise<Map<string, T>> {
    return new Map(
      [...this.data].filter(([k, v]) => !v.deleted && ids.includes(k))
    );
  }

  async save(entity: T): Promise<void> {
    this.data.set(entity.id, entity);
  }

  async saveAll(entities: T[]): Promise<void> {
    entities.forEach((e) => this.data.set(e.id, e));
  }

  async findOne(
    query: Q,
    sort?: Sort,
    additionalFilters?: Array<AdditionalFilter<T>>
  ): Promise<V | undefined> {
    const filters = [];
    if (additionalFilters !== undefined) {
      filters.push(...additionalFilters);
    }
    filters.push(...this.doConvertAdditionalQuery(query));
    const entities = await this.doFetchEntities(
      filters,
      sort ?? [],
      { size: 1, startFrom: "FIRST" },
      query
    );
    return entities[0]?.toValue();
  }

  private compareFunc(
    a: T,
    b: T,
    sort: Sort,
    startFrom: "FIRST" | "LAST"
  ): number {
    for (const { field, order } of [...sort, { field: "id", order: "ASC" }]) {
      const result = this.doCompare(a, b, field);

      if (result !== 0) {
        if (
          (order === "ASC" && startFrom === "FIRST") ||
          (order === "DESC" && startFrom === "LAST")
        ) {
          return result;
        }
        return result * -1;
      }
    }

    return 0;
  }

  async doFetchEntities(
    filters: Array<AdditionalFilter<T>>,
    sort: Sort,
    pagination: Pagination,
    query?: Q
  ): Promise<T[]> {
    let entities = await this.doFindAll(sort, pagination, query);
    let result = await filtersAllMatching(entities, filters);

    while (entities.length > 0 && result.length < pagination.size + 1) {
      let idx = 0;
      if (pagination.startFrom === "FIRST") {
        idx = entities.length - 1;
      }

      const nextPagination =
        pagination.startFrom === "FIRST"
          ? { ...pagination, after: entities[idx]?.toCursor() }
          : { ...pagination, before: entities[idx]?.toCursor() };

      // eslint-disable-next-line no-await-in-loop
      const tempEntities = await this.doFindAll(sort, nextPagination, query);
      if (tempEntities.length === 0) {
        break;
      }
      entities = tempEntities;
      // eslint-disable-next-line no-await-in-loop
      const tempResult = await filtersAllMatching(tempEntities, filters);
      result =
        pagination.startFrom === "FIRST"
          ? [...result, ...tempResult]
          : [...tempResult, ...result];
    }

    return result;
  }

  private readonly filterFunc = (
    a: T,
    sort: Sort,
    pagination: Pagination
  ): boolean => {
    let result = true;

    if (pagination.after != null) {
      const after = this.data.get(cursorToId(pagination.after));
      if (after != null) {
        const compareTo = this.compareFunc(
          a,
          after,
          sort,
          pagination.startFrom
        );
        result =
          result &&
          (pagination.startFrom === "FIRST" ? compareTo > 0 : compareTo < 0);
      }
    }

    if (pagination.before != null) {
      const before = this.data.get(cursorToId(pagination.before));
      if (before != null) {
        const compareTo = this.compareFunc(
          a,
          before,
          sort,
          pagination.startFrom
        );
        result =
          result &&
          (pagination.startFrom === "LAST" ? compareTo > 0 : compareTo < 0);
      }
    }

    return result;
  };

  async doFindAll(sort: Sort, pagination: Pagination, query?: Q): Promise<T[]> {
    const result = [...this.data.values()]
      .filter(
        (a) =>
          this.filterFunc(a, sort, pagination) &&
          this.doQuery(a, query) &&
          !a.deleted
      )
      .sort((a, b) => this.compareFunc(a, b, sort, pagination.startFrom))
      .slice(0, pagination.size);

    if (pagination.startFrom === "LAST") {
      result.reverse();
    }

    return result;
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async findAll(
    sort: Sort,
    pagination: Pagination,
    query?: Q,
    additionalFilters?: Array<AdditionalFilter<T>>
  ): Promise<PageResult<V>> {
    const filters = [];
    if (additionalFilters !== undefined) {
      filters.push(...additionalFilters);
    }
    filters?.push(...this.doConvertAdditionalQuery(query));

    const entities = await this.doFetchEntities(
      filters,
      sort,
      pagination,
      query
    );

    const afterEntity =
      pagination.after != null &&
      (await this.findById(cursorToId(pagination.after)));

    const beforeEntity =
      pagination.before != null &&
      (await this.findById(cursorToId(pagination.before)));

    const hasPreviousPage =
      Boolean(afterEntity) ||
      (pagination.startFrom === "LAST" && entities.length > pagination.size);

    const hasNextPage =
      Boolean(beforeEntity) ||
      (pagination.startFrom === "FIRST" && entities.length > pagination.size);

    let start = 0;
    let end: number | undefined = pagination.size;
    if (pagination.startFrom === "LAST") {
      start = -pagination.size;
      end = undefined;
    }
    const pageItems = entities.slice(start, end).map((e) => ({
      cursor: e.toCursor(),
      data: e.toValue(),
    }));

    return {
      pageInfo: {
        hasPreviousPage,
        hasNextPage,
        startCursor: pageItems[0]?.cursor,
        endCursor: pageItems[pageItems.length - 1]?.cursor,
      },
      pageItems,
    };
  }
}
