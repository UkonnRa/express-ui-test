import { AbstractEntity, CommandInput } from "@white-rabbit/business-logic";
import { Command } from "@white-rabbit/types";
import AbstractExceptionTask from "./abstract-exception-task";

export default interface HandleCommandExceptionTask<
  E extends AbstractEntity<E>,
  C extends Command,
  CC extends C = any
> extends AbstractExceptionTask<E, CommandInput<CC>, E | null> {
  readonly type: "HandleCommandExceptionTask";
}
