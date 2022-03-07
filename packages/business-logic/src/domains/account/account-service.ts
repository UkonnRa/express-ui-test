import { inject, singleton } from 'tsyringe';
import { Account } from './account';
import { AccountCommandCreate, AccountCommandDelete, AccountCommandUpdate, AccountValue } from './index';
import { AccountQuery } from './account-query';
import AbstractService from '../../shared/abstract-service';
import AuthUser from '../../shared/auth-user';
import { AccountRepository } from '../index';
import JournalService from '../journal/journal-service';

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
    this.checkScope(authUser);

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
