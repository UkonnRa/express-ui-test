import AbstractEntity from './abstract-entity';
import AuthUser from './auth-user';
import AbstractRepository, { PageResult, Pagination, Sort } from './abstract-repository';
import { InvalidQueryError, NoAuthError, NoExpectedScopeError, NotFoundError } from './errors';
import { Role } from '../domains/user';

export default abstract class AbstractService<
  T extends AbstractEntity<T, V>,
  R extends AbstractRepository<T, V, Q>,
  V,
  Q,
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

  async findValueById({ user, scopes }: AuthUser, id: string): Promise<V> {
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

    return entity.toValue();
  }

  async findAllValues(
    { user, scopes }: AuthUser,
    sort: Sort,
    pagination: Pagination,
    query?: Q,
  ): Promise<PageResult<V>> {
    if (!scopes.includes(this.readScope)) {
      throw new NoExpectedScopeError(user, this.readScope);
    }

    if (!query && user.role === Role.USER) {
      throw new InvalidQueryError('undefined');
    }

    return this.repository.findAll(sort, pagination, query, [
      (es) => Promise.resolve(es.filter((e) => e.isReadable(user))),
    ]);
  }
}
