import { AbstractEntity, FindInput } from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";

export default interface FindOneTask<E extends AbstractEntity<E>, Q>
  extends AbstractTask<E, FindInput<E, Q>, E | null> {
  readonly type: "FindOneTask";
}
