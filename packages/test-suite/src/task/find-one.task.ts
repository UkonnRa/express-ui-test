import {
  AbstractEntity,
  AuthUser,
  FindOneInput,
  Query,
} from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";

interface CheckerInput<E extends AbstractEntity<E>, I> {
  readonly authUser: AuthUser;
  readonly input?: I;
  readonly item: E | null;
}

export default interface FindOneTask<E extends AbstractEntity<E>, V>
  extends AbstractTask<FindOneInput<E>, V> {
  readonly type: "FindOneTask";
  readonly checker: (input: CheckerInput<E, Query<E>>) => Promise<void>;
}
