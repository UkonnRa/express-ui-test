import { AbstractEntity, CommandsInput } from "@white-rabbit/business-logic";
import { Command } from "@white-rabbit/types";
import AbstractExceptionTask from "./abstract-exception-task";

export default interface HandleCommandsExceptionTask<
  E extends AbstractEntity<E>,
  C extends Command
> extends AbstractExceptionTask<E, CommandsInput<C>, Array<E | null>> {
  readonly type: "HandleCommandsExceptionTask";
}
