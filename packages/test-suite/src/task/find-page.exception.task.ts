import { AbstractEntity, FindPageInput } from "@white-rabbit/business-logic";
import { PageItem } from "@white-rabbit/types";
import AbstractExceptionTask from "./abstract-exception-task";

export default interface FindPageExceptionTask<E extends AbstractEntity<E>, Q>
  extends AbstractExceptionTask<E, FindPageInput<E, Q>, Array<PageItem<E>>> {
  readonly type: "FindPageExceptionTask";
}
