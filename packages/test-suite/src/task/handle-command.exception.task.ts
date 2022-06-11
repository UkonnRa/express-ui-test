import {
  AbstractEntity,
  Command,
  CommandInput,
} from "@white-rabbit/business-logic";
import AbstractExceptionTask from "./abstract-exception-task";

export default interface HandleCommandExceptionTask<
  E extends AbstractEntity<E>,
  C extends Command,
  CC extends C = any
> extends AbstractExceptionTask<E, CommandInput<CC>, E | null> {
  readonly type: "HandleCommandExceptionTask";
}
