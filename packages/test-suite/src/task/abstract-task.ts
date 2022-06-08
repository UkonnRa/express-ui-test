import { ObjectQuery } from "@mikro-orm/core";
import { AuthUser, UserEntity } from "@white-rabbit/business-logic";

export type AuthUserInput = Partial<Omit<AuthUser, "user">> & {
  user?: ObjectQuery<UserEntity>;
};

export default interface AbstractTask<I> {
  readonly type: string;
  readonly name: string;
  readonly input: Omit<I, "authUser"> & { authUser: AuthUserInput };
  readonly setup?: () => Promise<void>;
}
