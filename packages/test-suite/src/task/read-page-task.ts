import {
  PageResult,
  Pagination,
  Sort,
} from "@white-rabbit/business-logic/src/shared/abstract-repository";
import AuthUser from "@white-rabbit/business-logic/src/shared/auth-user";
import { AbstractError } from "@white-rabbit/business-logic/src/shared/errors";
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

export class ReadTaskPageSuccess<
  Q,
  V,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  QQ extends Q = any
> extends AbstractReadTaskSuccess<QueryType<QQ>, PageResult<V>, "Page"> {
  override readonly readType = "Page";

  constructor(
    override readonly name: string,
    override readonly authUserHandler: () => AuthUser,
    override readonly inputHandler: () => QueryType<QQ>,
    override readonly handler: (
      context: ReadContextSuccess<QueryType<QQ>, PageResult<V>>
    ) => void
  ) {
    super(name, authUserHandler, inputHandler);
  }
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

export type ReadTaskPage<Q, V> =
  | ReadTaskPageSuccess<Q, V>
  | ReadTaskPageFailure<Q>;
