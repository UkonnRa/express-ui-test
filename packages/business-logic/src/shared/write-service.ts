import {
  AbstractEntity,
  AuthUser,
  Command,
  CommandInput,
  CommandsInput,
} from "./index";
import { EntityDTO, EntityManager } from "@mikro-orm/core";

export default interface WriteService<
  E extends AbstractEntity<E>,
  C extends Command
> {
  readonly writeScope: string;
  readonly handle: (
    command: CommandInput<C>,
    em?: EntityManager
  ) => Promise<EntityDTO<E> | null>;
  readonly handleAll: (
    commands: CommandsInput<C>,
    em?: EntityManager
  ) => Promise<Array<EntityDTO<E> | null>>;
  readonly isWriteable: (entity: E, authUser?: AuthUser) => Promise<boolean>;
}
