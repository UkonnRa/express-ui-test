import {
  AbstractEntity,
  AuthUser,
  Command,
  CommandInput,
  CommandsInput,
} from "./index";
import {
  EntityDTO,
  EntityManager,
  FilterQuery,
  MikroORM,
  ObjectQuery,
} from "@mikro-orm/core";
import { AlreadyExistError, NoPermissionError, NotFoundError } from "../error";
import { EntityName } from "@mikro-orm/core/typings";
import { RoleValue } from "../user";
import ReadService from "./read-service";
import RequiredFieldError from "../error/required-field.error";

function checkPermission<E extends AbstractEntity<E>>(
  entityType: string,
  { user, scopes }: AuthUser,
  scope: string,
  entity?: E
): void {
  if (!scopes.includes(scope)) {
    throw new NoPermissionError(entityType, "WRITE");
  }

  if (user?.deletedAt != null) {
    throw new NotFoundError(entityType, user.id);
  }

  if (
    entity?.deletedAt != null &&
    (user?.role ?? RoleValue.USER) === RoleValue.USER
  ) {
    throw new NotFoundError(entityType, entity.id);
  }
}

export async function checkCreate<E extends AbstractEntity<E>>(
  entityType: string,
  entityName: EntityName<E>,
  authUser: AuthUser,
  scope: string,
  uniqueFilter: FilterQuery<E> | null,
  em: EntityManager
): Promise<void> {
  checkPermission(entityType, authUser, scope);
  if (uniqueFilter != null) {
    const entity = await em.findOne(entityName, uniqueFilter);
    if (entity != null) {
      throw new AlreadyExistError(entityType, JSON.stringify(uniqueFilter));
    }
  }
}

export default abstract class WriteService<
  E extends AbstractEntity<E>,
  C extends Command
> extends ReadService<E> {
  protected constructor(
    override readonly orm: MikroORM,
    override readonly type: string,
    override readonly entityName: EntityName<E>,
    override readonly readScope: string,
    readonly writeScope: string,
    readonly createCommands: Array<C["type"]>
  ) {
    super(orm, type, entityName, readScope);
  }

  abstract handle(
    command: CommandInput<C>,
    em?: EntityManager
  ): Promise<E | null>;

  readonly handleAll = async (
    { authUser, commands }: CommandsInput<C>,
    em?: EntityManager
  ): Promise<Array<EntityDTO<E> | null>> =>
    (em ?? this.orm.em.fork()).transactional(async (emInst) => {
      const idMap: Record<string, string> = {};
      const results = [];
      for (const command of commands) {
        if (this.createCommands.includes(command.type)) {
          const result = await this.handle({ authUser, command }, emInst);
          results.push(result?.toObject() ?? null);
          if (result != null && command.targetId != null) {
            idMap[command.targetId] = (result as any).id;
          }
        } else if (command.targetId != null) {
          const result = await this.handle(
            {
              authUser,
              command: {
                ...command,
                targetId: idMap[command.targetId] ?? command.targetId,
              },
            },
            emInst
          );
          results.push(result?.toObject() ?? null);
        } else {
          throw new RequiredFieldError(command.type, "id");
        }
      }
      return results;
    });

  async checkWriteable(entity: E, authUser: AuthUser): Promise<void> {
    checkPermission(this.type, authUser, this.writeScope, entity);
  }

  readonly getWriteableEntity = async (
    authUser: AuthUser,
    id: string,
    em: EntityManager
  ): Promise<E> => {
    const entity = await em.findOneOrFail(
      this.entityName,
      { id } as ObjectQuery<E>,
      {
        filters: { excludeDeleted: false },
        failHandler: () => new NotFoundError(this.type, id),
      }
    );

    await this.checkWriteable(entity, authUser);

    return entity;
  };
}
