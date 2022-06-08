import {
  AbstractEntity,
  FindAllInput,
  PageItem,
} from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";

export default interface FindAllTask<E extends AbstractEntity<E>>
  extends AbstractTask<FindAllInput<E>> {
  readonly type: "FindAllTask";
  readonly checker: (items: Array<PageItem<E>>) => void;
  readonly expectPreviousPage?: boolean;
  readonly expectNextPage?: boolean;
}
