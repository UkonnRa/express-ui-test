import { inject, singleton } from 'tsyringe';
import AbstractService from '../../shared/abstract-service';
import { UserValue } from './user-value';
import { UserQuery } from './user-query';
import { Role, User } from './user';
import { UserRepository } from './index';
import AuthUser from '../../shared/auth-user';
import { UserCommandCreate, UserCommandDelete, UserCommandUpdate } from './user-command';
import { NoAuthError, NoExpectedScopeError, NotFoundError } from '../../shared/errors';

@singleton()
export default class UserService extends AbstractService<User, UserRepository, UserValue, UserQuery> {
  constructor(@inject('UserRepository') protected override readonly repository: UserRepository) {
    super('User', 'users:read', 'users:write', repository);
  }

  async createUser(
    { authId, authIdValue, user, scopes }: AuthUser,
    { name, role, authIds }: UserCommandCreate,
  ): Promise<string> {
    if (!scopes.includes(this.writeScope)) {
      throw new NoExpectedScopeError(authIdValue, this.writeScope);
    }

    let result: User;
    if (!user) {
      if (role !== Role.USER) {
        throw new NoAuthError(this.type, user, undefined, 'role');
      }

      if (authIds && authIds.size > 0) {
        throw new NoAuthError(this.type, user, undefined, 'authIds');
      }

      result = new User({ name, role, authIds: new Map([[authId.provider, authId.id]]) });
    } else if (user.role > role) {
      result = new User({ name, role, authIds });
    } else {
      throw new NoAuthError(this.type, user.id);
    }

    await this.repository.save(result);
    return result.id;
  }

  async updateUser(authUser: AuthUser, { id, name, role, authIds }: UserCommandUpdate): Promise<void> {
    const entity = await this.getEntity(authUser, id);

    const operator = authUser.user;
    if (!operator) {
      throw new NotFoundError('User', authUser.authIdValue);
    }

    if (!name && !role && !authIds) {
      return;
    }

    if (name) {
      entity.name = name;
    }

    if (role) {
      if (operator.role > role) {
        entity.role = role;
      } else {
        throw new NoAuthError(this.type, operator.id, id, 'role');
      }
    }

    if (authIds) {
      if (operator.role > Role.USER) {
        entity.authIds = authIds;
      } else {
        throw new NoAuthError(this.type, operator.id, id, 'authIds');
      }
    }

    await this.repository.save(entity);
  }

  async deleteUser(authUser: AuthUser, { id }: UserCommandDelete): Promise<void> {
    const entity = await this.getEntity(authUser, id);

    entity.deleted = true;

    await this.repository.save(entity);
  }
}
