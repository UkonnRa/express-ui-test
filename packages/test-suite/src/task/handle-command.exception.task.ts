import { Command, CommandInput } from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";

type ExpectedType<C extends Command> =
  | Record<string, unknown>
  | ((command: CommandInput<C>) => Promise<Record<string, unknown>>);

export default interface HandleCommandExceptionTask<C extends Command, V = any>
  extends AbstractTask<CommandInput<C>, V> {
  readonly type: "HandleCommandExceptionTask";
  readonly expected: ExpectedType<C>;
}
