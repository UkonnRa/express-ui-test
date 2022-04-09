import { AuthUser, AbstractError } from "@white-rabbit/business-logic";
import {
  AbstractReadTaskFailure,
  AbstractReadTaskSuccess,
  ReadContextFailure,
  ReadContextSuccess,
} from "./read-task";

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
    override readonly handler: (context: ReadContextSuccess<string, V>) => void
  ) {
    super(name, authUserHandler, inputHandler);
  }
}

export class ReadTaskSingleFailure<
  E extends AbstractError = AbstractError
> extends AbstractReadTaskFailure<string, "Single", E> {
  override readonly readType = "Single";

  constructor(
    override readonly name: string,
    override readonly authUserHandler: () => AuthUser,
    override readonly inputHandler: () => string,
    override readonly errorHandler: (
      context: ReadContextFailure<string>
    ) => Partial<E>
  ) {
    super(name, authUserHandler, inputHandler);
  }
}

export type ReadTaskSingle<V> =
  | ReadTaskSingleSuccess<V>
  | ReadTaskSingleFailure;
