import {
  PageResult,
  Pagination,
  Sort,
} from "@white-rabbit/business-logic/src/shared/abstract-repository";
import AuthUser from "@white-rabbit/business-logic/src/shared/auth-user";
import { AbstractReadTaskFailure, AbstractReadTaskSuccess } from "./read-task";
import { ErrorType } from "./abstract-task";

interface QueryType<Q> {
  sort: Sort;
  pagination: Pagination;
  query?: Q;
}

export class ReadTaskPageSuccess<Q, V> extends AbstractReadTaskSuccess<
  QueryType<Q>,
  PageResult<V>,
  "Page"
> {
  override readonly readType = "Page";

  constructor(
    override readonly name: string,
    override readonly authUserHandler: () => AuthUser,
    override readonly inputHandler: () => QueryType<Q>,
    override readonly handler: (result: PageResult<V>) => void
  ) {
    super(name, authUserHandler, inputHandler);
  }
}

export class ReadTaskPageFailure<Q> extends AbstractReadTaskFailure<
  QueryType<Q>,
  "Page"
> {
  override readonly readType = "Page";

  constructor(
    override readonly name: string,
    override readonly authUserHandler: () => AuthUser,
    override readonly inputHandler: () => QueryType<Q>,
    override readonly error: ErrorType
  ) {
    super(name, authUserHandler, inputHandler);
  }
}

export type ReadTaskPage<Q, V> =
  | ReadTaskPageSuccess<Q, V>
  | ReadTaskPageFailure<Q>;
