import AuthUser from "@white-rabbit/business-logic/src/shared/auth-user";

export type ErrorType =
  | string
  | (new (...args: unknown[]) => unknown)
  | RegExp
  | Error;

export interface AbstractTask<I> {
  readonly type: "Success" | "Failure";

  readonly name: string;

  readonly authUserHandler: () => AuthUser;

  readonly inputHandler: () => I;
}
