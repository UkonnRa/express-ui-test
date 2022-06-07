import { EntityManager, MikroORM } from "@mikro-orm/core";
import { EntityName } from "@mikro-orm/core/typings";
import AbstractEntity from "./abstract-entity";
import Command from "./command";
import ReadService from "./read-service";
import WriteService from "./write-service";
import CommandInput from "./command.input";
import AuthUser from "./auth-user";
import RoleValue from "../user/role.value";

export default abstract class Service<
    E extends AbstractEntity<E>,
    C extends Command
  >
  extends ReadService<E>
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

  abstract handle(
    command: CommandInput<C>,
    em?: EntityManager
  ): Promise<E | null>;

  abstract handleAll(
    commands: Array<CommandInput<C>>,
    em?: EntityManager
  ): Promise<Array<E | null>>;

  abstract isWriteable(entity: E, authUser?: AuthUser): Promise<boolean>;

  isScopeIncluded(scope: string, entity: E, authUser?: AuthUser): boolean {
    if (authUser == null || !authUser.scopes.includes(scope)) {
      return false;
    } else if (entity.deletedAt != null) {
      return (authUser.user?.role ?? RoleValue.USER) > RoleValue.USER;
    }
    return true;
  }
}
