import { AbstractEntity, FindAllInput } from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";

export default interface FindAllExceptionTask<E extends AbstractEntity<E>>
  extends AbstractTask<FindAllInput<E>> {
  readonly type: "FindAllExceptionTask";
  readonly expected: Record<string, unknown>;
}
