import {
  EntityManager,
  EntityName,
  FilterQuery,
  MikroORM,
  ObjectQuery,
  QueryOrderMap,
} from "@mikro-orm/core";
import { decodeCursor, encodeCursor, filterAsync } from "../utils";
import { NoPermissionError, NotFoundError } from "../error";
import Cursor from "./cursor";
import AbstractEntity from "./abstract-entity";
import AuthUser from "./auth-user";
import Sort from "./sort";
import Order from "./order";
import FindPageInput from "./find-page.input";
import Page from "./page";
import PageItem from "./page-item";
import FindOneInput from "./find-one.input";
import Pagination from "./pagination";
import { AdditionalQuery, Query } from "./query";
import RoleValue from "./role.value";

type CursorAndObject = [Cursor, Record<string, unknown>];

function createNormalizedSort(
  sort: Sort[],
  reverse: boolean = false
): [Array<[string, Order]>, Order] {
  const getOrder = (order: Order): Order => {
    if (!reverse) return order;
    else return order === Order.ASC ? Order.DESC : Order.ASC;
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
        { id: { [idOrder === Order.ASC ? "$gt" : "$lt"]: after[1].id } },
      ],
    });
  }

  const additionalFilterQuery =
    additionalQuery.$or.length === 0
      ? null
      : (additionalQuery as ObjectQuery<E>);

  return [
    {
      ...(query ?? {}),
      ...(additionalFilterQuery ?? {}),
    } as ObjectQuery<E>,
    Object.fromEntries(
      normedSort.some(([k]) => k === "id")
        ? normedSort
        : [...normedSort, ["id", idOrder]]
    ) as QueryOrderMap<E>,
    reversed,
  ];
}

export default abstract class ReadService<E extends AbstractEntity<E>> {
  protected constructor(
    readonly orm: MikroORM,
    readonly type: string,
    readonly entityName: EntityName<E>,
    readonly readScope: string
  ) {}

  /**
   * isReadable should only contain business-specific logic.
   * Especially DO NOT contain:
   * * whether the authUser has scope
   * * whether the entity is already deleted
   *
   * @param entity
   * @param user
   */
  async isReadable(entity: E, { user }: AuthUser): Promise<boolean> {
    return !(
      entity?.deletedAt != null &&
      (user?.role ?? RoleValue.USER) === RoleValue.USER
    );
  }

  async handleAdditionalQueries(
    entities: E[],
    _additionalQueries: AdditionalQuery[]
  ): Promise<E[]> {
    return entities;
  }

  private checkPermission(authUser: AuthUser, query?: Query<E>): void {
    if (!authUser.scopes.includes(this.readScope)) {
      throw new NoPermissionError(this.type, "READ");
    }

    if (authUser.user?.deletedAt != null) {
      throw new NotFoundError(this.type, authUser.user.id);
    }

    if (
      (authUser.user?.role ?? RoleValue.USER) === RoleValue.USER &&
      query?.$additional != null
    ) {
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

  private async doFindPage(
    filterQuery: ObjectQuery<E>,
    sort: QueryOrderMap<E>,
    pagination: Pagination,
    additionalQueries: AdditionalQuery[],
    externalQueries: Array<(entity: E) => Promise<boolean>>,
    em: EntityManager
  ): Promise<E[]> {
    let cnt = 0;
    const result: E[] = [];
    const limit = pagination.size + 1;

    // Fetching Deleted
    const filters = { excludeDeleted: true };
    if (additionalQueries.some((q) => q.type === "IncludeDeletedQuery")) {
      filters.excludeDeleted = false;
    }

    while (true) {
      let entities = await em.find(this.entityName, filterQuery, {
        orderBy: sort,
        offset: (pagination.offset ?? 0) + cnt * limit,
        limit,
        filters,
      });
      cnt += 1;
      if (entities.length === 0) {
        break;
      }
      entities = await filterAsync(entities, async (e) =>
        Promise.all(externalQueries.map(async (q) => q(e))).then((bs) =>
          bs.every((b) => b)
        )
      );
      result.push(
        ...(await this.handleAdditionalQueries(entities, additionalQueries))
      );
      if (result.length >= limit) {
        break;
      }
    }
    return result;
  }

  readonly findPage = async (
    input: FindPageInput<E>,
    em?: EntityManager
  ): Promise<Page<E>> => {
    this.checkPermission(input.authUser, input.query);

    const emInst = em ?? this.orm.em.fork();
    const after = await this.getCursorAndEntity(input.pagination.after, emInst);
    const before = await this.getCursorAndEntity(
      input.pagination.before,
      emInst
    );

    const additionalQueries = [];
    if (input.query?.$additional != null) {
      additionalQueries.push(...input.query.$additional);
    }
    const mikroQuery = Object.fromEntries(
      Object.entries(input.query ?? {}).filter(([k]) => k !== "$additional")
    ) as ObjectQuery<E>;

    const [filterQuery, sort, reversed] = await createCursorRelatedQueryAndSort(
      mikroQuery,
      input.sort,
      after,
      before
    );

    const externalQueries = [
      async (e: E) => this.isReadable(e, input.authUser),
    ];

    const entities = await this.doFindPage(
      filterQuery,
      sort,
      input.pagination,
      additionalQueries,
      externalQueries,
      emInst
    );
    let hasPreviousPage = false;
    let hasNextPage = false;
    const exceeded = entities.length > input.pagination.size;

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
      .slice(0, exceeded ? input.pagination.size : entities.length)
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
    { authUser, query }: FindOneInput<E>,
    em?: EntityManager
  ): Promise<E | null> => {
    this.checkPermission(authUser, query);

    const emInst = em ?? this.orm.em.fork();

    const additionalQueries = [];
    if (query?.$additional != null) {
      additionalQueries.push(...query.$additional);
    }
    const mikroQuery = Object.fromEntries(
      Object.entries(query ?? {}).filter(([k]) => k !== "$additional")
    ) as ObjectQuery<E>;

    const externalQueries = [async (e: E) => this.isReadable(e, authUser)];

    const entities = await this.doFindPage(
      mikroQuery,
      [{ id: Order.ASC }],
      { size: 1 },
      additionalQueries,
      externalQueries,
      emInst
    );
    if (entities[0] != null) {
      return entities[0];
    }
    return null;
  };
}
