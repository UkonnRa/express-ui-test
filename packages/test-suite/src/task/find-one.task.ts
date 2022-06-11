import { AbstractEntity, FindOneInput } from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";

export default interface FindOneTask<E extends AbstractEntity<E>>
  extends AbstractTask<E, FindOneInput<E>, E | null> {
  readonly type: "FindOneTask";
}
