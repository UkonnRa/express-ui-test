import { inject, singleton } from 'tsyringe';
import AbstractService from '../../shared/abstract-service';
import { AccountRepository, FinRecordRepository } from '../index';
import { FinItemValue, FinRecordValue } from './fin-record-value';
import { FinRecord, TYPE } from './fin-record';
import { FinRecordQuery } from './fin-record-query';
import AuthUser from '../../shared/auth-user';
import { FinRecordCommandCreate, FinRecordCommandDelete, FinRecordCommandUpdate } from './fin-record-command';
import UserService from '../user/user-service';
import JournalService from '../journal/journal-service';
import { FinItemCreateOptions } from './fin-item';

@singleton()
export default class FinRecordService extends AbstractService<
  FinRecord,
  FinRecordRepository,
  FinRecordValue,
  FinRecordQuery
> {
  constructor(
    @inject('FinRecordRepository') protected override readonly repository: FinRecordRepository,
    private readonly userService: UserService,
    private readonly journalService: JournalService,
    @inject('AccountRepository') private readonly accountRepository: AccountRepository,
  ) {
    super(TYPE, 'finRecords:read', 'finRecords:write', repository);
  }

  private async getItems(values: FinItemValue[]): Promise<FinItemCreateOptions[]> {
    const accounts = await this.accountRepository.findByIds(values.map(({ account }) => account));
    const result: FinItemCreateOptions[] = [];
    for (const { account, amount, unit, price, note } of values) {
      const accountValue = accounts.get(account);
      if (accountValue) {
        result.push({ account: accountValue, amount, unit, price, note });
      }
    }
    return result;
  }

  async createFinRecord(authUser: AuthUser, command: FinRecordCommandCreate): Promise<string> {
    this.checkScope(authUser);
    const user = await this.userService.getEntity(authUser, command.user, false);
    const journal = await this.journalService.getEntity(authUser, command.journal, false);
    const finRecord = new FinRecord({
      timestamp: command.timestamp,
      user,
      journal,
      name: command.name,
      description: command.description,
      items: await this.getItems(command.items),
      tags: command.tags,
      isContingent: command.isContingent,
    });
    await this.repository.save(finRecord);
    return finRecord.id;
  }

  async updateFinRecord(
    authUser: AuthUser,
    { id, timestamp, name, description, items, tags, isContingent }: FinRecordCommandUpdate,
  ): Promise<void> {
    const entity = await this.getEntity(authUser, id);
    if (!timestamp && !name && !description && !items && !tags && !isContingent) {
      return;
    }

    if (timestamp) {
      entity.timestamp = timestamp;
    }

    if (name) {
      entity.name = name;
    }

    if (description) {
      entity.description = description;
    }

    if (items) {
      entity.setItemWithOptions(await this.getItems(items));
    }

    if (tags) {
      entity.tags = tags;
    }

    if (isContingent) {
      entity.isContingent = isContingent;
    }

    await this.repository.save(entity);
  }

  async deleteFinRecord(authUser: AuthUser, { id }: FinRecordCommandDelete): Promise<void> {
    const entity = await this.getEntity(authUser, id);

    entity.deleted = true;

    await this.repository.save(entity);
  }
}
