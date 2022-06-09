import {
  AbstractEntity,
  AuthUser,
  Command,
  CommandInput,
} from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";
import { EntityDTO } from "@mikro-orm/core";

interface CheckerInput<E extends AbstractEntity<E>, C extends Command> {
  readonly authUser: AuthUser;
  readonly command: C;
  readonly item: EntityDTO<E> | null;
}

export default interface HandleCommandTask<
  E extends AbstractEntity<E>,
  C extends Command,
  CC extends C = any,
  V = unknown
> extends AbstractTask<CommandInput<CC>, V> {
  readonly type: "HandleCommandTask";
  readonly checker: (input: CheckerInput<E, CC>) => void;
}
