import AbstractEntity from './abstract-entity';
import AuthUser from './auth-user';
import AbstractRepository, { PageResult, Pagination, Sort } from './abstract-repository';
import { InvalidQueryError, NoAuthError, NoExpectedScopeError, NotFoundError } from './errors';
import { Role } from '../domains/user';
import { cursorToId } from '../utils';

export default abstract class AbstractService<
  T extends AbstractEntity<T, P>,
  R extends AbstractRepository<T, Q>,
  Q,
  P,
> {
  protected constructor(
    private readonly type: string,
    protected readonly readScope: string,
    protected readonly writeScope: string,
    protected readonly repository: R,
  ) {}

  protected async getWriteableEntity({ user, scopes }: AuthUser, id: string): Promise<T> {
    if (!scopes.includes(this.writeScope)) {
      throw new NoExpectedScopeError(user, this.writeScope);
    }

    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError(this.type, id);
    }

    if (!entity.isWritable(user)) {
      throw new NoAuthError(user, this.type, id);
    }

    return entity;
  }

  async findProjectionById({ user, scopes }: AuthUser, id: string): Promise<P> {
    if (!scopes.includes(this.readScope)) {
      throw new NoExpectedScopeError(user, this.readScope);
    }

    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError(this.type, id);
    }

    if (!entity.isReadable(user)) {
      throw new NoAuthError(user, this.type, id);
    }

    return entity.toProjection();
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async findAllProjections(
    { user, scopes }: AuthUser,
    sort: Sort,
    pagination: Pagination,
    query?: Q,
  ): Promise<PageResult<P>> {
    if (!scopes.includes(this.readScope)) {
      throw new NoExpectedScopeError(user, this.readScope);
    }

    if (!query && user.role === Role.USER) {
      throw new InvalidQueryError('undefined');
    }

    let entities = await this.repository.findAll(sort, pagination, query);

    entities = entities.filter((e) => e.isReadable(user));

    if (entities.length > 0 && pagination.size !== undefined && entities.length < pagination.size) {
      while (entities.length < pagination.size + 1) {
        let idx = 0;
        if (pagination.startFrom === 'FIRST') {
          idx = entities.length - 1;
        }

        const entity = entities[idx];
        if (!entity) {
          break;
        }

        const pagi =
          pagination.startFrom === 'FIRST'
            ? { after: entity.toCursor(), ...pagination }
            : { before: entity.toCursor(), ...pagination };

        // eslint-disable-next-line no-await-in-loop
        const temp = (await this.repository.findAll(sort, pagi)).filter((e) => e.isReadable(user));
        if (temp.length === 0) {
          break;
        }

        entities = pagination.startFrom === 'FIRST' ? [...entities, ...temp] : [...temp, ...entities];
      }
    }

    let firstEntity: T | undefined;
    if (pagination.after) {
      firstEntity = await this.repository.findById(cursorToId(pagination.after));
    }

    let lastEntity: T | undefined;
    if (pagination.before) {
      lastEntity = await this.repository.findById(cursorToId(pagination.before));
    }

    let hasPreviousPage = false;
    if (
      (pagination.startFrom === 'FIRST' && firstEntity) ||
      (pagination.startFrom === 'LAST' && entities.length > pagination.size)
    ) {
      hasPreviousPage = true;
    }

    let hasNextPage = false;
    if (
      (pagination.startFrom === 'LAST' && lastEntity) ||
      (pagination.startFrom === 'FIRST' && entities.length > pagination.size)
    ) {
      hasNextPage = true;
    }

    const pageItems = entities.slice(0, pagination.size).map((e) => ({
      cursor: e.toCursor(),
      data: e.toProjection(),
    }));

    return {
      pageInfo: {
        hasPreviousPage,
        hasNextPage,
        startCursor: pageItems[0]?.cursor,
        endCursor: pageItems[pageItems.length - 1]?.cursor,
      },
      pageItems,
    };
  }
}
