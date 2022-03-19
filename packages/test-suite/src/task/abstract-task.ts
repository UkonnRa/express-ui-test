import AuthUser from "@white-rabbit/business-logic/src/shared/auth-user";

export interface AbstractTask<I> {
  readonly type: "Success" | "Failure";

  readonly name: string;

  readonly authUserHandler: () => AuthUser;

  readonly inputHandler: () => I;
}
