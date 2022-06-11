import {
  AbstractEntity,
  Command,
  CommandsInput,
} from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";
import { EntityDTO } from "@mikro-orm/core";

export default interface HandleCommandsTask<
  E extends AbstractEntity<E>,
  C extends Command
> extends AbstractTask<E, CommandsInput<C>, Array<EntityDTO<E> | null>> {
  readonly type: "HandleCommandsTask";
}
