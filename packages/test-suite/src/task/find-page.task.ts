import { AbstractEntity, FindPageInput } from "@white-rabbit/business-logic";
import { PageItem } from "@white-rabbit/types";
import AbstractTask from "./abstract-task";

export default interface FindPageTask<E extends AbstractEntity<E>, Q>
  extends AbstractTask<E, FindPageInput<E, Q>, Array<PageItem<E>>> {
  readonly type: "FindPageTask";
  readonly expectPreviousPage?: boolean;
  readonly expectNextPage?: boolean;
}
