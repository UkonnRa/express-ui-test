import {
  AbstractEntity,
  FindAllInput,
  PageItem,
} from "@white-rabbit/business-logic";
import AbstractExceptionTask from "./abstract-exception-task";

export default interface FindAllExceptionTask<E extends AbstractEntity<E>>
  extends AbstractExceptionTask<E, FindAllInput<E>, Array<PageItem<E>>> {
  readonly type: "FindAllExceptionTask";
}
