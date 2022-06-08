import { AbstractEntity, FindAllInput } from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";

export default interface FindAllExceptionTask<E extends AbstractEntity<E>, V>
  extends AbstractTask<FindAllInput<E>, V> {
  readonly type: "FindAllExceptionTask";
  readonly expected: Record<string, unknown>;
}
