import { AbstractEntity, AuthUser, Command, CommandInput } from "./index";
import { EntityManager } from "@mikro-orm/core";

export default interface WriteService<
  E extends AbstractEntity<E>,
  C extends Command
> {
  readonly writeScope: string;
  readonly handle: (
    command: CommandInput<C>,
    em?: EntityManager
  ) => Promise<E | null>;
  readonly handleAll: (
    commands: Array<CommandInput<C>>,
    em?: EntityManager
  ) => Promise<Array<E | null>>;
  readonly isWriteable: (entity: E, authUser?: AuthUser) => Promise<boolean>;
}
