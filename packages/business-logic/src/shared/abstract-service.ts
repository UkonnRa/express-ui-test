import AbstractEntity from './abstract-entity';
import AuthUser from './auth-user';
import AbstractRepository, { PageResult, Pagination, Sort } from './abstract-repository';
import { InvalidQueryError, NoAuthError, NoExpectedScopeError, NotFoundError } from './errors';
import { Role, TYPE_USER, User } from '../domains/user';

export default abstract class AbstractService<
  T extends AbstractEntity<T, V, unknown>,
  R extends AbstractRepository<T, V, Q>,
  V,
  Q,
> {
  protected constructor(
    protected readonly type: string,
    protected readonly readScope: string,
    protected readonly writeScope: string,
    protected readonly repository: R,
  ) {}

  protected checkScope({ authIdValue, user, scopes }: AuthUser, needWriteable = true): User {
    if (!user) {
      throw new NotFoundError(TYPE_USER, authIdValue);
    }

    const scopeNeeded = needWriteable ? this.writeScope : this.readScope;

    if (!scopes.includes(scopeNeeded)) {
      throw new NoExpectedScopeError(user.id, scopeNeeded);
    }

    return user;
  }

  async getEntity(authUser: AuthUser, id: string, needWriteable = true): Promise<T> {
    const user = this.checkScope(authUser, needWriteable);

    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError(this.type, id);
    }

    const entityAuthed = needWriteable ? entity.isWritable(user) : entity.isReadable(user);
    if (!entityAuthed) {
      throw new NoAuthError(this.type, user.id, id);
    }

    return entity;
  }

  findValueById(authUser: AuthUser, id: string): Promise<V> {
    return this.getEntity(authUser, id, false).then((e) => e.toValue());
  }

  async findAllValues(authUser: AuthUser, sort: Sort, pagination: Pagination, query?: Q): Promise<PageResult<V>> {
    const user = this.checkScope(authUser, false);

    if (!query && user.role === Role.USER) {
      throw new InvalidQueryError('undefined');
    }

    return this.repository.findAll(sort, pagination, query, [
      (es) => Promise.resolve(es.filter((e) => e.isReadable(user))),
    ]);
  }
}
