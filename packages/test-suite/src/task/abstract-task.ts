import { AuthUser } from "@white-rabbit/business-logic";

export interface AbstractTask<I> {
  readonly type: "Success" | "Failure";

  readonly name: string;

  readonly authUserHandler: () => AuthUser;

  readonly inputHandler: (authUser: AuthUser) => I;
}
