import {
  AbstractEntity,
  Command,
  CommandsInput,
} from "@white-rabbit/business-logic";
import { CheckerInput } from "./handle-commands.task";
import { EntityManager } from "@mikro-orm/core";
import AbstractExceptionTask from "./abstract-exception-task";

export default interface HandleCommandsExceptionTask<
  E extends AbstractEntity<E>,
  C extends Command,
  V = any
> extends AbstractExceptionTask<CommandsInput<C>, V> {
  readonly type: "HandleCommandsExceptionTask";
  readonly checker: (
    input: CheckerInput<E, C>,
    em: EntityManager
  ) => Promise<void>;
}
