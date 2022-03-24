import AuthUser from "@white-rabbit/business-logic/src/shared/auth-user";
import { AbstractError } from "@white-rabbit/business-logic/src/shared/errors";
import { AbstractTask } from "./abstract-task";

interface ContextSuccess<C, T> {
  readonly command: C;
  readonly authUser: AuthUser;
  readonly result?: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class WriteTaskSuccess<C, T, CC extends C = any>
  implements AbstractTask<C>
{
  readonly type = "Success";

  constructor(
    readonly name: string,
    readonly authUserHandler: () => AuthUser,
    readonly inputHandler: () => CC,
    readonly handler: (context: ContextSuccess<CC, T>) => void
  ) {}
}

interface ContextFailure<C> {
  readonly command: C;
  readonly authUser: AuthUser;
}

export class WriteTaskFailure<
  C,
  E extends AbstractError = AbstractError,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CC extends C = any
> implements AbstractTask<C>
{
  readonly type = "Failure";

  constructor(
    readonly name: string,
    readonly authUserHandler: () => AuthUser,
    readonly inputHandler: () => CC,
    readonly errorHandler: (context: ContextFailure<CC>) => Partial<E>
  ) {}
}

export type WriteTask<C, T> = WriteTaskSuccess<C, T> | WriteTaskFailure<C>;