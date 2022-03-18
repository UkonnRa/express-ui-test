import AuthUser from "@white-rabbit/business-logic/src/shared/auth-user";
import { ErrorType } from "./abstract-task";
import { AbstractReadTaskFailure, AbstractReadTaskSuccess } from "./read-task";

export class ReadTaskSingleSuccess<V> extends AbstractReadTaskSuccess<
  string,
  V,
  "Single"
> {
  override readonly readType = "Single";

  constructor(
    override readonly name: string,
    override readonly authUserHandler: () => AuthUser,
    override readonly inputHandler: () => string,
    override readonly handler: (result: V) => void
  ) {
    super(name, authUserHandler, inputHandler);
  }
}

export class ReadTaskSingleFailure extends AbstractReadTaskFailure<
  string,
  "Single"
> {
  override readonly readType = "Single";

  constructor(
    override readonly name: string,
    override readonly authUserHandler: () => AuthUser,
    override readonly inputHandler: () => string,
    override readonly error: ErrorType
  ) {
    super(name, authUserHandler, inputHandler);
  }
}

export type ReadTaskSingle<V> =
  | ReadTaskSingleSuccess<V>
  | ReadTaskSingleFailure;
