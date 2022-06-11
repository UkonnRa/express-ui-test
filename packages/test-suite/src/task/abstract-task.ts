import { EntityManager, ObjectQuery } from "@mikro-orm/core";
import {
  AbstractEntity,
  AuthUser,
  UserEntity,
} from "@white-rabbit/business-logic";

export type AuthUserInput = Partial<Omit<AuthUser, "user">> & {
  user?: ObjectQuery<UserEntity>;
};

export type Input<I> = Omit<I, "authUser"> & { authUser: AuthUserInput };

export interface CheckerInput<E extends AbstractEntity<E>, I, R> {
  readonly input: I;
  readonly item: R;
}

export default interface AbstractTask<E extends AbstractEntity<E>, I, R> {
  readonly type: string;
  readonly name: string;
  readonly input: Input<I> | ((em: EntityManager) => Promise<Input<I>>);
  readonly checker?: (
    input: CheckerInput<E, I, R>,
    em: EntityManager
  ) => Promise<void>;
}
