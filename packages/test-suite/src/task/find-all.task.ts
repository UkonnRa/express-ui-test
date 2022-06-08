import {
  AbstractEntity,
  FindAllInput,
  PageItem,
} from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";

export default interface FindAllTask<E extends AbstractEntity<E>, V>
  extends AbstractTask<FindAllInput<E>, V> {
  readonly type: "FindAllTask";
  readonly checker: (items: Array<PageItem<E>>) => void;
  readonly expectPreviousPage?: boolean;
  readonly expectNextPage?: boolean;
}
