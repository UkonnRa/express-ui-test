import { AuthUser, AbstractError } from "@white-rabbit/business-logic";
import { AbstractTask } from "./abstract-task";

export type ReadType = "Single" | "Page";

export interface AbstractReadTask<I, T extends ReadType>
  extends AbstractTask<I> {
  readonly readType: T;
}

export interface ReadContextSuccess<I, V> {
  readonly input: I;
  readonly authUser: AuthUser;
  readonly result: V;
}

export abstract class AbstractReadTaskSuccess<I, V, T extends ReadType>
  implements AbstractReadTask<I, T>
{
  readonly type = "Success";

  readonly readType: T;

  readonly handler: (context: ReadContextSuccess<I, V>) => void;

  protected constructor(
    readonly name: string,
    readonly authUserHandler: () => AuthUser,
    readonly inputHandler: () => I
  ) {}
}

export interface ReadContextFailure<I> {
  readonly input: I;
  readonly authUser: AuthUser;
}

export abstract class AbstractReadTaskFailure<
  I,
  T extends ReadType,
  E extends AbstractError = AbstractError
> implements AbstractReadTask<I, T>
{
  readonly type = "Failure";

  readonly readType: T;

  readonly errorHandler: (context: ReadContextFailure<I>) => Partial<E>;

  protected constructor(
    readonly name: string,
    readonly authUserHandler: () => AuthUser,
    readonly inputHandler: () => I
  ) {}
}
