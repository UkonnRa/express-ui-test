import { Role, TYPE_USER, User } from "../domains/user";
import AbstractEntity from "./abstract-entity";
import { AuthUser } from "./auth-user";
import {
  AbstractRepository,
  PageResult,
  Pagination,
  Sort,
} from "./abstract-repository";
import {
  InvalidQueryError,
  NoAuthError,
  NoExpectedScopeError,
  NotFoundError,
} from "./errors";

export default abstract class AbstractService<
  T extends AbstractEntity<T, V, unknown>,
  R extends AbstractRepository<T, V, Q>,
  V,
  Q,
  C
> {
  protected constructor(
    protected readonly type: string,
    readonly readScope: string,
    readonly writeScope: string,
    protected readonly repository: R
  ) {}

  abstract handle(authUser: AuthUser, command: C): Promise<string>;

  protected checkScope(
    { authIdValue, user, scopes }: AuthUser,
    needWriteable = true
  ): User {
    if (user == null) {
      throw new NotFoundError(TYPE_USER, authIdValue);
    }

    const scopeNeeded = needWriteable ? this.writeScope : this.readScope;

    if (!scopes.includes(scopeNeeded)) {
      throw new NoExpectedScopeError(user.id, scopeNeeded);
    }

    return user;
  }

  async getEntity(
    authUser: AuthUser,
    id: string,
    needWriteable = true
  ): Promise<T> {
    const user = this.checkScope(authUser, needWriteable);

    const entity = await this.repository.findById(id);
    if (entity == null) {
      throw new NotFoundError(this.type, id);
    }

    if (!needWriteable && !entity.isReadable(user)) {
      throw new NotFoundError(entity.entityType, id);
    }

    if (needWriteable && !entity.isWritable(user)) {
      throw new NoAuthError(entity.entityType, user.id, id);
    }

    return entity;
  }

  async findValueById(authUser: AuthUser, id: string): Promise<V> {
    return this.getEntity(authUser, id, false).then((e) => e.toValue());
  }

  async findAllValues(
    authUser: AuthUser,
    sort: Sort,
    pagination: Pagination,
    query?: Q
  ): Promise<PageResult<V>> {
    const user = this.checkScope(authUser, false);

    if (
      (query == null || Object.entries(query).length === 0) &&
      user.role === Role.USER
    ) {
      throw new InvalidQueryError(JSON.stringify(query));
    }

    return this.repository.findAll(sort, pagination, query, [
      async (es) => es.filter((e) => e.isReadable(user)),
    ]);
  }
}
