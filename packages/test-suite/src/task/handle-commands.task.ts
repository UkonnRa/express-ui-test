import { AbstractEntity, CommandsInput } from "@white-rabbit/business-logic";
import { EntityDTO } from "@mikro-orm/core";
import { Command } from "@white-rabbit/types";
import AbstractTask from "./abstract-task";

export default interface HandleCommandsTask<
  E extends AbstractEntity<E>,
  C extends Command
> extends AbstractTask<E, CommandsInput<C>, Array<EntityDTO<E> | null>> {
  readonly type: "HandleCommandsTask";
}
