import { AbstractEntity, FindOneInput } from "@white-rabbit/business-logic";
import AbstractExceptionTask from "./abstract-exception-task";

export default interface FindOneExceptionTask<E extends AbstractEntity<E>>
  extends AbstractExceptionTask<E, FindOneInput<E>, E | null> {
  readonly type: "FindOneExceptionTask";
}
