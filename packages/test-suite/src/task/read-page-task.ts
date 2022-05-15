import {
  AuthUser,
  AbstractEntity,
  AbstractError,
} from "@white-rabbit/business-logic";
import { PageResult, QueryType } from "@white-rabbit/type-bridge";
import {
  AbstractReadTaskFailure,
  AbstractReadTaskSuccess,
  ReadContextFailure,
  ReadContextSuccess,
} from "./read-task";

interface ExpectedResult<Q, V> {
  current: (result: ReadContextSuccess<Q | undefined, PageResult<V>>) => void;
  previous?: (
    result: ReadContextSuccess<Q | undefined, PageResult<V>>,
    originalResult: PageResult<V>
  ) => void;
  next?: (
    result: ReadContextSuccess<Q | undefined, PageResult<V>>,
    originalResult: PageResult<V>
  ) => void;
}

interface ActualResult<V> {
  page: PageResult<V>;
  position: "current" | "previous" | "next";
}

export class ReadTaskPageSuccess<
  T extends AbstractEntity<T, V>,
  Q,
  V,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  QQ extends Q = any
> extends AbstractReadTaskSuccess<QueryType<QQ>, ActualResult<V>, "Page"> {
  override readonly readType = "Page";

  constructor(
    override readonly name: string,
    override readonly authUserHandler: () => AuthUser,
    override readonly inputHandler: (authUser: AuthUser) => QueryType<QQ>,
    readonly expectedResult: ExpectedResult<QQ, V>
  ) {
    super(name, authUserHandler, inputHandler);
  }

  override readonly handler = (
    context: ReadContextSuccess<QueryType<QQ>, ActualResult<V>>
  ): void => {
    const { page, position } = context.result;
    const itemsFunc = this.expectedResult[position];
    if (itemsFunc == null) {
      fail(`Position[${position}] does not exist`);
      return;
    }

    itemsFunc(
      { input: context.input.query, authUser: context.authUser, result: page },
      context.result.page
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

export type ReadTaskPage<T extends AbstractEntity<T, V>, Q, V> =
  | ReadTaskPageSuccess<T, Q, V>
  | ReadTaskPageFailure<Q>;
