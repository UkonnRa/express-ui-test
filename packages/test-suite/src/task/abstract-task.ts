import { EntityManager, ObjectQuery } from "@mikro-orm/core";
import { AuthUser, UserEntity } from "@white-rabbit/business-logic";

export type AuthUserInput = Partial<Omit<AuthUser, "user">> & {
  user?: ObjectQuery<UserEntity>;
};

type Input<I> = Omit<I, "authUser"> & { authUser: AuthUserInput };

export default interface AbstractTask<I, V> {
  readonly type: string;
  readonly name: string;
  readonly input: Input<I> | ((data: V) => Promise<Input<I>>);
  readonly setup?: (em: EntityManager) => Promise<V>;
}
