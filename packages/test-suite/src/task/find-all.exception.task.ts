import { AbstractEntity, FindAllInput } from "@white-rabbit/business-logic";
import AbstractExceptionTask from "./abstract-exception-task";

export default interface FindAllExceptionTask<E extends AbstractEntity<E>, V>
  extends AbstractExceptionTask<FindAllInput<E>, V> {
  readonly type: "FindAllExceptionTask";
}
