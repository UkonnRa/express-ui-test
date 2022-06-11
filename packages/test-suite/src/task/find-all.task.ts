import {
  AbstractEntity,
  FindAllInput,
  PageItem,
} from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";

export default interface FindAllTask<E extends AbstractEntity<E>>
  extends AbstractTask<E, FindAllInput<E>, Array<PageItem<E>>> {
  readonly type: "FindAllTask";
  readonly expectPreviousPage?: boolean;
  readonly expectNextPage?: boolean;
}
