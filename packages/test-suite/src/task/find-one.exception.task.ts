import { AbstractEntity, FindOneInput } from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";

export default interface FindOneExceptionTask<E extends AbstractEntity<E>, V>
  extends AbstractTask<FindOneInput<E>, V> {
  readonly type: "FindOneExceptionTask";
  readonly expected: Record<string, unknown>;
}
