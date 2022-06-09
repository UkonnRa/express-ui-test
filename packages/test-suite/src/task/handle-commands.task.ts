import {
  AbstractEntity,
  AuthUser,
  Command,
  CommandsInput,
} from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";
import { EntityDTO } from "@mikro-orm/core";

export interface CheckerInput<E extends AbstractEntity<E>, C extends Command> {
  readonly authUser: AuthUser;
  readonly commands: C[];
  readonly items: Array<EntityDTO<E> | null>;
}

export default interface HandleCommandsTask<
  E extends AbstractEntity<E>,
  C extends Command,
  V = any
> extends AbstractTask<CommandsInput<C>, V> {
  readonly type: "HandleCommandsTask";
  readonly checker: (input: CheckerInput<E, C>) => void;
}
