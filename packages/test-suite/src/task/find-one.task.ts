import { AbstractEntity, FindOneInput } from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";
import { EntityDTO } from "@mikro-orm/core";

export default interface FindOneTask<E extends AbstractEntity<E>, V>
  extends AbstractTask<FindOneInput<E>, V> {
  readonly type: "FindOneTask";
  readonly checker: (item: EntityDTO<E> | null) => void;
}
