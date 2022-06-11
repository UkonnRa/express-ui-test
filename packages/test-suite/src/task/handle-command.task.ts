import {
  AbstractEntity,
  Command,
  CommandInput,
} from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";

export default interface HandleCommandTask<
  E extends AbstractEntity<E>,
  C extends Command,
  CC extends C = any
> extends AbstractTask<E, CommandInput<CC>, E | null> {
  readonly type: "HandleCommandTask";
}
