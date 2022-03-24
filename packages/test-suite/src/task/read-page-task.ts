import {
  PageResult,
  Pagination,
  Sort,
} from "@white-rabbit/business-logic/src/shared/abstract-repository";
import AuthUser from "@white-rabbit/business-logic/src/shared/auth-user";
import { AbstractError } from "@white-rabbit/business-logic/src/shared/errors";
import AbstractEntity from "@white-rabbit/business-logic/src/shared/abstract-entity";
import {
  AbstractReadTaskFailure,
  AbstractReadTaskSuccess,
  ReadContextFailure,
  ReadContextSuccess,
} from "./read-task";

interface QueryType<Q> {
  sort: Sort;
  pagination: Pagination;
  query?: Q;
}

interface ExpectedResult {
  current: number[];
  previous?: number[];
  next?: number[];
}

interface ActualResult<V> {
  page: PageResult<V>;
  position: "current" | "previous" | "next";
}

export class ReadTaskPageSuccess<
  T extends AbstractEntity<T, V, unknown>,
  Q,
  V,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  QQ extends Q = any
> extends AbstractReadTaskSuccess<QueryType<QQ>, ActualResult<V>, "Page"> {
  override readonly readType = "Page";

  constructor(
    override readonly name: string,
    override readonly authUserHandler: () => AuthUser,
    override readonly inputHandler: () => QueryType<QQ>,
    private readonly entitiesHandler: () => T[],
    readonly expectedResult: ExpectedResult
  ) {
    super(name, authUserHandler, inputHandler);
  }

  override readonly handler = (
    context: ReadContextSuccess<QueryType<QQ>, ActualResult<V>>
  ): void => {
    const { page, position } = context.result;
    const entities = this.entitiesHandler();
    const items = this.expectedResult[position];
    if (items == null) {
      fail(`Position[${position}] does not exist`);
      return;
    }
    const data = items.map((i) => entities[i]);
    expect(page.pageItems).toStrictEqual(
      data.map((e) => ({
        cursor: e?.toCursor(),
        data: e?.toValue(),
      }))
    );
  };
}

export class ReadTaskPageFailure<
  Q,
  E extends AbstractError = AbstractError,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  QQ extends Q = any
> extends AbstractReadTaskFailure<QueryType<QQ>, "Page", E> {
  override readonly readType = "Page";

  constructor(
    override readonly name: string,
    override readonly authUserHandler: () => AuthUser,
    override readonly inputHandler: () => QueryType<QQ>,
    override readonly errorHandler: (
      context: ReadContextFailure<QueryType<QQ>>
    ) => Partial<E>
  ) {
    super(name, authUserHandler, inputHandler);
  }
}

export type ReadTaskPage<T extends AbstractEntity<T, V, unknown>, Q, V> =
  | ReadTaskPageSuccess<T, Q, V>
  | ReadTaskPageFailure<Q>;
