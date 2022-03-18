import AuthUser from "@white-rabbit/business-logic/src/shared/auth-user";
import { AbstractTask, ErrorType } from "./abstract-task";

export class WriteTaskSuccess<C, T> implements AbstractTask<C> {
  readonly type = "Success";

  constructor(
    readonly name: string,
    readonly authUserHandler: () => AuthUser,
    readonly inputHandler: () => C,
    readonly handler: (entity?: T) => void
  ) {}
}

export class WriteTaskFailure<C> implements AbstractTask<C> {
  readonly type = "Failure";

  constructor(
    readonly name: string,
    readonly authUserHandler: () => AuthUser,
    readonly inputHandler: () => C,
    readonly error: ErrorType
  ) {}
}

export type WriteTask<C, T> = WriteTaskSuccess<C, T> | WriteTaskFailure<C>;
