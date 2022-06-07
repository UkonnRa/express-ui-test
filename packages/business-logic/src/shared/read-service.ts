import {
  EntityManager,
  EntityName,
  FilterQuery,
  MikroORM,
  QueryOrderMap,
  ObjectQuery,
} from "@mikro-orm/core";
import { decode, encodeURL } from "js-base64";
import Cursor from "./cursor";
import AbstractEntity from "./abstract-entity";
import AuthUser from "./auth-user";
import Sort from "./sort";
import Order from "./order";
import FindAllInput, { AdditionalQuery } from "./find-all.input";
import Page from "./page";
import PageItem from "./page-item";
import FindOneInput from "./find-one.input";
import Pagination from "./pagination";

type CursorAndObject = [Cursor, Record<string, unknown>];

export default abstract class ReadService<E extends AbstractEntity<E>, V> {
  protected constructor(
    readonly orm: MikroORM,
    readonly readScope: string,
    readonly entityType: EntityName<E>
  ) {}

  private static decodeCursor(cursor: string): Cursor {
    return JSON.parse(decode(cursor));
  }

  private static encodeCursor(cursor: Cursor): string {
    return encodeURL(JSON.stringify(cursor));
  }

  abstract toValue(entity: E): V;

  abstract isReadable(entity: E, authUser?: AuthUser): boolean;

  abstract handleAdditionalQueries(
    entities: E[],
    additionalQueries: AdditionalQuery[]
  ): Promise<E[]>;

  private createNormalizedSort(
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

  private async getCursorAndEntity(
    cursor: string | undefined,
    em: EntityManager
  ): Promise<CursorAndObject | null> {
    if (cursor == null) {
      return null;
    }
    const cursorObj = ReadService.decodeCursor(cursor);
    const entity = await em.findOne(
      this.entityType,
      cursorObj.id as FilterQuery<E>
    );
    if (entity == null) {
      return null;
    }
    return [cursorObj, entity.toObject()];
  }

  private static queryWhenDifferentSortValue<E extends AbstractEntity<E>>(
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

  private async createCursorRelatedQueryAndSort(
    { query, sort }: FindAllInput<E>,
    after: CursorAndObject | null,
    before: CursorAndObject | null
  ): Promise<[ObjectQuery<E>, QueryOrderMap<E>, boolean]> {
    const reversed = before != null && after == null;
    const [normedSort, idOrder] = this.createNormalizedSort(sort, reversed);
    const queryWhenDifferentSortValue = ReadService.queryWhenDifferentSortValue(
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
      Object.fromEntries([...normedSort, ["id", idOrder]]) as QueryOrderMap<E>,
      reversed,
    ];
  }

  private async doFindAll(
    filterQuery: FilterQuery<E>,
    sort: QueryOrderMap<E>,
    pagination: Pagination,
    additionalQueries: AdditionalQuery[],
    externalQueries: Array<(entity: E) => boolean>,
    em: EntityManager
  ): Promise<E[]> {
    let cnt = 0;
    const result: E[] = [];
    const limit = pagination.size + 1;
    while (true) {
      let entities = await em.find(this.entityType, filterQuery, {
        orderBy: sort,
        offset: (pagination.offset ?? 0) + cnt * limit,
        limit: limit,
      });
      cnt += 1;
      if (entities.length === 0) {
        break;
      }
      entities = entities.filter((e) => externalQueries.every((q) => q(e)));
      result.push(
        ...(await this.handleAdditionalQueries(entities, additionalQueries))
      );
      if (result.length >= limit) {
        break;
      }
    }
    return result;
  }

  async findAll(query: FindAllInput<E>, em?: EntityManager): Promise<Page<V>> {
    const emInst = em ?? this.orm.em.fork();
    const after = await this.getCursorAndEntity(query.pagination.after, emInst);
    const before = await this.getCursorAndEntity(
      query.pagination.before,
      emInst
    );
    const [filterQuery, sort, reversed] =
      await this.createCursorRelatedQueryAndSort(query, after, before);
    const additionalQueries = [];
    if (query.query?.$additional != null) {
      additionalQueries.push(...query.query.$additional);
      delete query.query.$additional;
    }

    const externalQueries = [(e: E) => this.isReadable(e, query.authUser)];

    const entities = await this.doFindAll(
      filterQuery,
      sort,
      query.pagination,
      additionalQueries,
      externalQueries,
      emInst
    );
    let hasPreviousPage = false;
    let hasNextPage = false;
    const exceeded = entities.length > query.pagination.size;

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
      .slice(0, exceeded ? query.pagination.size : entities.length)
      .map<PageItem<V>>((e) => ({
        cursor: ReadService.encodeCursor({ id: e.id }),
        data: this.toValue(e),
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
  }

  async findOne(query: FindOneInput<E>, em?: EntityManager): Promise<V | null> {
    const emInst = em ?? this.orm.em.fork();
    const entity = await emInst.findOne(
      this.entityType,
      query.query ?? ({} as ObjectQuery<E>)
    );
    if (entity == null) {
      return null;
    }
    return this.toValue(entity);
  }
}
