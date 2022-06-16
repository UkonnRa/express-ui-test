import {
  AbstractEntity,
  FindPageInput,
  PageItem,
} from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";

export default interface FindPageTask<E extends AbstractEntity<E>>
  extends AbstractTask<E, FindPageInput<E>, Array<PageItem<E>>> {
  readonly type: "FindPageTask";
  readonly expectPreviousPage?: boolean;
  readonly expectNextPage?: boolean;
}
