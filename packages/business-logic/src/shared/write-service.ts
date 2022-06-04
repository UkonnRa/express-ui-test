import { AbstractEntity, AuthUser, Command, CommandInput } from "./index";
import { EntityManager } from "@mikro-orm/core";

export default interface WriteService<
  E extends AbstractEntity<E>,
  C extends Command
> {
  writeScope: string;
  handle: (command: CommandInput<C>, em?: EntityManager) => E | null;
  handleAll: (
    commands: Array<CommandInput<C>>,
    em?: EntityManager
  ) => Array<E | null>;
  isWriteable: (entity: E, authUser?: AuthUser) => boolean;
}
