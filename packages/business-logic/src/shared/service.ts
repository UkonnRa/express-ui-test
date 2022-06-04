import {
  AbstractEntity,
  AuthUser,
  Command,
  CommandInput,
  ReadService,
  WriteService,
} from "./index";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import { EntityName } from "@mikro-orm/core/typings";

export default abstract class Service<
    E extends AbstractEntity<E>,
    V,
    C extends Command,
    Q = object
  >
  extends ReadService<E, V, Q>
  implements WriteService<E, C>
{
  protected constructor(
    override readonly orm: MikroORM,
    override readonly readScope: string,
    readonly writeScope: string,
    override entityType: EntityName<E>
  ) {
    super(orm, readScope, entityType);
  }

  abstract handle(command: CommandInput<C>, em?: EntityManager): E | null;

  abstract handleAll(
    commands: Array<CommandInput<C>>,
    em?: EntityManager
  ): Array<E | null>;

  abstract isWriteable(entity: E, authUser?: AuthUser): boolean;
}
