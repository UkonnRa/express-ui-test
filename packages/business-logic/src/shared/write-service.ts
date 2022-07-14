import {
  EntityDTO,
  EntityManager,
  FilterQuery,
  MikroORM,
  ObjectQuery,
} from "@mikro-orm/core";
import { EntityName } from "@mikro-orm/core/typings";
import { Command } from "@white-rabbit/types";
import { AlreadyExistError, NoPermissionError, NotFoundError } from "../error";
import RequiredFieldError from "../error/required-field.error";
import ReadService from "./read-service";
import AbstractEntity from "./abstract-entity";
import AuthUser from "./auth-user";
import CommandInput from "./command.input";
import CommandsInput from "./commands.input";

function checkPermission<E extends AbstractEntity<E>>(
  entityType: string,
  { scopes }: AuthUser,
  scope: string,
  _?: E
): void {
  if (!scopes.includes(scope)) {
    throw new NoPermissionError(entityType, "WRITE");
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
  C extends Command,
  Q
> extends ReadService<E, Q> {
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

  abstract doHandle(
    command: CommandInput<C>,
    em: EntityManager
  ): Promise<E | null>;

  readonly handle = async (
    command: CommandInput<C>,
    em?: EntityManager
  ): Promise<E | null> =>
    (em ?? this.orm.em.fork()).transactional(async (em) =>
      this.doHandle(command, em)
    );

  readonly handleAll = async (
    { authUser, commands }: CommandsInput<C>,
    em?: EntityManager
  ): Promise<Array<EntityDTO<E> | null>> =>
    (em ?? this.orm.em.fork()).transactional(async (em) => {
      const idMap: Record<string, string> = {};
      const results = [];
      for (const command of commands) {
        if (this.createCommands.includes(command.type)) {
          const result = await this.doHandle({ authUser, command }, em);
          results.push(result?.toObject() ?? null);
          if (result != null && command.targetId != null) {
            idMap[command.targetId] = (result as any).id;
          }
        } else if (command.targetId != null) {
          const result = await this.doHandle(
            {
              authUser,
              command: {
                ...command,
                targetId: idMap[command.targetId] ?? command.targetId,
              },
            },
            em
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
        failHandler: () => new NotFoundError(this.type, id),
      }
    );

    await this.checkWriteable(entity, authUser);

    return entity;
  };
}
