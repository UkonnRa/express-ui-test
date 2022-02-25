import { inject, singleton } from 'tsyringe';
import { Account } from './account';
import {
  AccountCommandCreate,
  AccountCommandDelete,
  AccountCommandUpdate,
  AccountRepository,
  AccountValue,
} from './index';
import { AccountQuery } from './account-query';
import AbstractService from '../../shared/abstract-service';
import AuthUser from '../../shared/auth-user';
import { JournalService } from '../journal';
import { NoExpectedScopeError, NotFoundError } from '../../shared/errors';

console.log('AccountService - AbstractService: ', AbstractService);

@singleton()
export default class AccountService extends AbstractService<Account, AccountRepository, AccountValue, AccountQuery> {
  constructor(
    @inject('AccountRepository') protected override readonly repository: AccountRepository,
    private readonly journalService: JournalService,
  ) {
    super('Account', 'accounts:read', 'accounts:write', repository);
  }

  async createAccount(
    authUser: AuthUser,
    { name, description, journal, accountType, unit, strategy }: AccountCommandCreate,
  ): Promise<string> {
    if (!authUser.user) {
      throw new NotFoundError('User', authUser.authIdValue);
    }
    if (!authUser.scopes.includes(this.writeScope)) {
      throw new NoExpectedScopeError(authUser.user.id, this.writeScope);
    }

    const journalEntity = await this.journalService.getEntity(authUser, journal, false);

    const entity = new Account({ name, description, journal: journalEntity, accountType, unit, strategy });

    await this.repository.save(entity);

    return entity.id;
  }

  async updateAccount(
    authUser: AuthUser,
    { id, name, description, accountType, unit, strategy }: AccountCommandUpdate,
  ): Promise<void> {
    const entity = await this.getEntity(authUser, id);

    if (!name && !description && !accountType && !unit && !strategy) {
      return;
    }

    if (name) {
      entity.name = name;
    }

    if (description) {
      entity.description = description;
    }

    if (accountType) {
      entity.accountType = accountType;
    }

    if (unit) {
      entity.unit = unit;
    }

    if (strategy) {
      entity.strategy = strategy;
    }

    await this.repository.save(entity);
  }

  async deleteAccount(authUser: AuthUser, { id }: AccountCommandDelete): Promise<void> {
    const entity = await this.getEntity(authUser, id);
    entity.deleted = true;
    await this.repository.save(entity);
  }
}
