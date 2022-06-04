import {
  AbstractEntity,
  AuthUser,
  FindAllInput,
  FindOneInput,
  Page,
} from "./index";
import { EntityManager, MikroORM, EntityName } from "@mikro-orm/core";

// type Matcher<E> = (item: E) => Promise<boolean>;

export default abstract class ReadService<E extends AbstractEntity<E>, V> {
  protected constructor(
    readonly orm: MikroORM,
    readonly readScope: string,
    readonly entityType: EntityName<E>
  ) {}

  // private decodeCursor(cursor: string): Cursor {
  //   return JSON.parse(decode(cursor));
  // }
  //
  // private encodeCursor(cursor: Cursor): string {
  //   return encode(JSON.stringify(cursor));
  // }
  //
  // private async findAllUntil(
  //   filter: FilterQuery<E>,
  //   matchers: Array<Matcher<E>>,
  //   size: number,
  //   offset: number,
  //   em: EntityManager
  // ): Promise<E[]> {
  //   const result = [];
  //   const cnt = 0;
  //   // We should fetch at least `size + 1` entities to make sure we can find the prev/next link
  //   while (result.length < size + 1) {
  //     const items = await em.find(this.entityType, filter, {
  //       limit: size,
  //       offset: offset + cnt * size,
  //     });
  //     for (const item of items) {
  //       const allMatched = (
  //         await Promise.all(matchers.map(async (m) => await m(item)))
  //       ).every((b) => b);
  //       if (allMatched) {
  //         result.push(item);
  //       }
  //     }
  //   }
  //   return result;
  // }
  //
  // private createOrderBy(
  //   sort: Sort[],
  //   reverse: boolean = false
  // ): QueryOrderMap<E> {
  //   return Object.fromEntries(
  //     sort.map(({ field, order }) => [
  //       field,
  //       order === Order.ASC || reverse ? QueryOrder.ASC : QueryOrder.DESC,
  //     ])
  //   ) as QueryOrderMap<E>;
  // }

  abstract findAll(
    query: FindAllInput<E>,
    em?: EntityManager
  ): Promise<Page<V>>;

  abstract findOne(
    query: FindOneInput<E>,
    em?: EntityManager
  ): Promise<V | null>;

  abstract isReadable(entity: E, authUser?: AuthUser): boolean;
}
