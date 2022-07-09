import { AbstractEntity, CommandInput } from "@white-rabbit/business-logic";
import { Command } from "@white-rabbit/types";
import AbstractTask from "./abstract-task";

export default interface HandleCommandTask<
  E extends AbstractEntity<E>,
  C extends Command,
  CC extends C = any
> extends AbstractTask<E, CommandInput<CC>, E | null> {
  readonly type: "HandleCommandTask";
}
