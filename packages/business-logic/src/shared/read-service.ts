import {
  EntityManager,
  EntityName,
  FilterQuery,
  MikroORM,
  ObjectQuery,
  QueryOrderMap,
  QueryOrderNumeric,
} from "@mikro-orm/core";
import {
  AdditionalQuery,
  Cursor,
  Order,
  Page,
  PageItem,
  Pagination,
  Sort,
} from "@white-rabbit/types";
import { decodeCursor, encodeCursor, filterAsync } from "../utils";
import { NoPermissionError, InvalidQueryError } from "../error";
import AbstractEntity from "./abstract-entity";
import AuthUser from "./auth-user";
import FindPageInput from "./find-page.input";
import FindInput from "./find.input";

type CursorAndObject = [Cursor, Record<string, unknown>];

function createNormalizedSort(
  sort: Sort[],
  reverse: boolean = false
): [Array<[string, QueryOrderNumeric]>, QueryOrderNumeric] {
  const getOrder = (order: Order): QueryOrderNumeric => {
    if (!reverse)
      return order === Order.ASC
        ? QueryOrderNumeric.ASC
        : QueryOrderNumeric.DESC;
    else
      return order === Order.ASC
        ? QueryOrderNumeric.DESC
        : QueryOrderNumeric.ASC;
  };
  return [
    sort.map(({ field, order }) => [field, getOrder(order)]),
    getOrder(Order.ASC),
  ];
}

function getQueryWhenDifferentSortValue<E extends AbstractEntity<E>>(
  sort: Sort[],
  after?: Record<string, unknown>,
  before?: Record<string, unknown>
): ObjectQuery<E> {
  return Object.fromEntries(
    sort
      .map(({ field, order }) => {
        const query: Record<string, unknown> = {};
        if (after?.[field] != null) {
          query[order === Order.ASC ? "$gt" : "$lt"] = after[field];
        }
        if (before?.[field] != null) {
          query[order === Order.ASC ? "$lt" : "$gt"] = before[field];
        }

        return [field, query];
      })
      .filter(([_, query]) => Object.keys(query).length > 0)
  );
}

async function createCursorRelatedQueryAndSort<E extends AbstractEntity<E>>(
  query: ObjectQuery<E> | undefined,
  sort: Sort[],
  after: CursorAndObject | null,
  before: CursorAndObject | null
): Promise<[ObjectQuery<E>, QueryOrderMap<E>, boolean]> {
  const reversed = before != null && after == null;
  const [normedSort, idOrder] = createNormalizedSort(sort, reversed);
  const queryWhenDifferentSortValue = getQueryWhenDifferentSortValue(
    sort,
    after?.[1],
    before?.[1]
  );

  const additionalQuery: { $or: unknown[] } = {
    $or: [],
  };

  if (Object.keys(queryWhenDifferentSortValue).length > 0) {
    additionalQuery.$or.push(queryWhenDifferentSortValue);
  }

  if (after != null) {
    additionalQuery.$or.push({
      $and: [
        Object.fromEntries(
          normedSort
            .map(([field]) => [field, after[1][field]])
            .filter(([_, q]) => q != null)
        ),
        {
          id: {
            [idOrder === QueryOrderNumeric.ASC ? "$gt" : "$lt"]: after[1].id,
          },
        },
      ],
    });
  }

  const additionalFilterQuery =
    additionalQuery.$or.length === 0
      ? null
      : (additionalQuery as ObjectQuery<E>);

  const orderMap = Object.fromEntries(
    normedSort.some(([k]) => k === "id")
      ? normedSort
      : [...normedSort, ["id", idOrder]]
  ) as QueryOrderMap<E>;

  return [
    {
      ...(query ?? {}),
      ...(additionalFilterQuery ?? {}),
    } as ObjectQuery<E>,
    orderMap,
    reversed,
  ];
}

const DEFAULT_SIZE = 100;

export default abstract class ReadService<E extends AbstractEntity<E>, Q> {
  protected constructor(
    readonly orm: MikroORM,
    readonly type: string,
    readonly entityName: EntityName<E>,
    readonly readScope: string
  ) {}

  abstract doGetQueries(query: Q): [AdditionalQuery[], ObjectQuery<E>];

  /**
   * isReadable should only contain business-specific logic.
   * Especially DO NOT contain:
   * * whether the authUser has scope
   * * whether the entity is already deleted
   */
  abstract isReadable(entity: E, authUser: AuthUser): Promise<boolean>;

  async handleAdditionalQuery(
    authUser: AuthUser,
    entities: E[],
    query: AdditionalQuery
  ): Promise<E[]> {
    if (query.type === "ReadableQuery") {
      return filterAsync(entities, async (entity) =>
        this.isReadable(entity, authUser)
      );
    } else {
      throw new InvalidQueryError(query.type, this.type);
    }
  }

  private getQueries(query?: Q): [AdditionalQuery[], ObjectQuery<E>] {
    if (query == null) {
      return [[], {} as ObjectQuery<E>];
    }
    const [additionalQuery, mikroQuery] = this.doGetQueries(query);
    additionalQuery.push({
      type: "ReadableQuery",
    });
    return [additionalQuery, mikroQuery];
  }

  private async handleAdditionalQueries(
    authUser: AuthUser,
    entities: E[],
    queries: AdditionalQuery[]
  ): Promise<E[]> {
    let result = entities;
    for (const query of queries) {
      result = await this.handleAdditionalQuery(authUser, result, query);
      if (result.length === 0) {
        break;
      }
    }
    return result;
  }

  private checkPermission(authUser: AuthUser): void {
    if (!authUser.scopes.includes(this.readScope)) {
      throw new NoPermissionError(this.type, "READ");
    }
  }

  private async getCursorAndEntity(
    cursor: string | undefined,
    em: EntityManager
  ): Promise<CursorAndObject | null> {
    if (cursor == null) {
      return null;
    }
    const cursorObj = decodeCursor(cursor);
    const entity = await em.findOne(
      this.entityName,
      cursorObj.id as FilterQuery<E>,
      { filters: { excludeDeleted: false } }
    );
    if (entity == null) {
      return null;
    }
    return [cursorObj, entity.toObject()];
  }

  private async doFindAll(
    authUser: AuthUser,
    filterQuery: ObjectQuery<E>,
    sort: QueryOrderMap<E> | undefined,
    pagination: Pagination | undefined,
    additionalQueries: AdditionalQuery[],
    em: EntityManager
  ): Promise<E[]> {
    let cnt = 0;
    const result: E[] = [];
    const limit = (pagination?.size ?? DEFAULT_SIZE) + 1;

    while (true) {
      const entities = await em.find(this.entityName, filterQuery, {
        orderBy: sort,
        offset: (pagination?.offset ?? 0) + cnt * limit,
        limit,
      });
      cnt += 1;
      if (entities.length === 0) {
        break;
      }
      result.push(
        ...(await this.handleAdditionalQueries(
          authUser,
          entities,
          additionalQueries
        ))
      );
      if (result.length >= limit) {
        break;
      }
    }
    return result;
  }

  readonly findAll = async (
    { authUser, query }: FindInput<E, Q>,
    em?: EntityManager
  ): Promise<E[]> => {
    this.checkPermission(authUser);

    const emInst = em ?? this.orm.em.fork();

    const [additionalQueries, mikroQuery] = this.getQueries(query);

    return this.doFindAll(
      authUser,
      mikroQuery,
      undefined,
      undefined,
      additionalQueries,
      emInst
    );
  };

  readonly findPage = async (
    { authUser, pagination, sort, query }: FindPageInput<E, Q>,
    em?: EntityManager
  ): Promise<Page<E>> => {
    this.checkPermission(authUser);

    const emInst = em ?? this.orm.em.fork();
    const after = await this.getCursorAndEntity(pagination.after, emInst);
    const before = await this.getCursorAndEntity(pagination.before, emInst);

    const [additionalQueries, mikroQuery] = this.getQueries(query);

    const [filterQuery, finalSort, reversed] =
      await createCursorRelatedQueryAndSort(mikroQuery, sort, after, before);

    const entities = await this.doFindAll(
      authUser,
      filterQuery,
      finalSort,
      pagination,
      additionalQueries,
      emInst
    );
    let hasPreviousPage = false;
    let hasNextPage = false;
    const exceeded = entities.length > pagination.size;

    if (reversed) {
      if (exceeded) {
        hasPreviousPage = true;
      }
      if (before != null) {
        hasNextPage = true;
      }
    } else {
      if (exceeded) {
        hasNextPage = true;
      }
      if (after != null) {
        hasPreviousPage = true;
      }
    }

    let pageItems = entities
      .slice(0, exceeded ? pagination.size : entities.length)
      .map<PageItem<E>>((data) => ({
        cursor: encodeCursor({ id: data.id }),
        data,
      }));
    if (reversed) {
      pageItems = pageItems.reverse();
    }

    return {
      items: pageItems,
      pageInfo: {
        hasPreviousPage,
        hasNextPage,
        startCursor: pageItems[0]?.cursor,
        endCursor: pageItems[pageItems.length - 1]?.cursor,
      },
    };
  };

  readonly findOne = async (
    { authUser, query }: FindInput<E, Q>,
    em?: EntityManager
  ): Promise<E | null> => {
    this.checkPermission(authUser);

    const emInst = em ?? this.orm.em.fork();

    const [additionalQueries, mikroQuery] = this.getQueries(query);

    const entities = await this.doFindAll(
      authUser,
      mikroQuery,
      [{ id: Order.ASC }],
      undefined,
      additionalQueries,
      emInst
    );
    if (entities[0] != null) {
      return entities[0];
    }
    return null;
  };
}
