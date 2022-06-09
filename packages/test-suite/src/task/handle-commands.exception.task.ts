import {
  AbstractEntity,
  Command,
  CommandsInput,
} from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";
import { CheckerInput } from "./handle-commands.task";
import { EntityManager } from "@mikro-orm/core";

type ExpectedType<C extends Command> =
  | Record<string, unknown>
  | ((commands: CommandsInput<C>) => Promise<Record<string, unknown>>);

export default interface HandleCommandsExceptionTask<
  E extends AbstractEntity<E>,
  C extends Command,
  V = any
> extends AbstractTask<CommandsInput<C>, V> {
  readonly type: "HandleCommandsExceptionTask";
  readonly expected: ExpectedType<C>;
  readonly checker: (
    input: CheckerInput<E, C>,
    em: EntityManager
  ) => Promise<void>;
}
