import { Command, CommandInput } from "@white-rabbit/business-logic";
import AbstractExceptionTask from "./abstract-exception-task";

export default interface HandleCommandExceptionTask<C extends Command, V = any>
  extends AbstractExceptionTask<CommandInput<C>, V> {
  readonly type: "HandleCommandExceptionTask";
}
