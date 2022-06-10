import { AbstractEntity, FindOneInput } from "@white-rabbit/business-logic";
import AbstractExceptionTask from "./abstract-exception-task";

export default interface FindOneExceptionTask<E extends AbstractEntity<E>, V>
  extends AbstractExceptionTask<FindOneInput<E>, V> {
  readonly type: "FindOneExceptionTask";
}
