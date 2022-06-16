import {
  AbstractEntity,
  FindPageInput,
  PageItem,
} from "@white-rabbit/business-logic";
import AbstractExceptionTask from "./abstract-exception-task";

export default interface FindPageExceptionTask<E extends AbstractEntity<E>>
  extends AbstractExceptionTask<E, FindPageInput<E>, Array<PageItem<E>>> {
  readonly type: "FindPageExceptionTask";
}
