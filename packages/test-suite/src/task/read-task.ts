import AuthUser from "@white-rabbit/business-logic/src/shared/auth-user";
import { AbstractTask, ErrorType } from "./abstract-task";

export type ReadType = "Single" | "Page";

export interface AbstractReadTask<I, T extends ReadType>
  extends AbstractTask<I> {
  readonly readType: T;
}

export abstract class AbstractReadTaskSuccess<I, V, T extends ReadType>
  implements AbstractReadTask<I, T>
{
  readonly type = "Success";

  readonly readType: T;

  readonly handler: (result: V) => void;

  protected constructor(
    readonly name: string,
    readonly authUserHandler: () => AuthUser,
    readonly inputHandler: () => I
  ) {}
}

export abstract class AbstractReadTaskFailure<I, T extends ReadType>
  implements AbstractReadTask<I, T>
{
  readonly type = "Failure";

  readonly readType: T;

  readonly error: ErrorType;

  protected constructor(
    readonly name: string,
    readonly authUserHandler: () => AuthUser,
    readonly inputHandler: () => I
  ) {}
}
