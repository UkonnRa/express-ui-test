import {
  Journal,
  JournalRepository,
  JournalValue,
  JournalQuery,
} from '@white-rabbit/business-logic/src/domains/journal';
import {
  Account,
  AccountRepository,
  FinRecord,
  FinRecordRepository,
} from '@white-rabbit/business-logic/src/domains/fin-record';
import { Group, GroupRepository } from '@white-rabbit/business-logic/src/domains/group';
import { User, UserQuery, UserRepository, UserValue } from '@white-rabbit/business-logic/src/domains/user';
import { container } from 'tsyringe';
import { InvalidSortFieldError } from '@white-rabbit/business-logic/src/shared/errors';
import MemoryRepository from './memory-repository';

export class MemoryAccountRepository extends MemoryRepository<Account, never, never> implements AccountRepository {
  doCompare(a: Account, b: Account, field: string): number {
    if (field === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (field === 'type') {
      return a.type.valueOf() - b.type.valueOf();
    }
    if (field === 'unit') {
      return a.unit.localeCompare(b.unit);
    }
    if (field === 'strategy') {
      return a.strategy.valueOf() - b.strategy.valueOf();
    }
    throw new InvalidSortFieldError('Account', field);
  }

  doQuery(): boolean {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error('Method not implemented.');
  }
}

export class MemoryFinRecordRepository
  extends MemoryRepository<FinRecord, never, never>
  implements FinRecordRepository
{
  doCompare(): number {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error('Method not implemented.');
  }

  doQuery(): boolean {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error('Method not implemented.');
  }
}

export class MemoryGroupRepository extends MemoryRepository<Group, never, never> implements GroupRepository {
  doCompare(): number {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error('Method not implemented.');
  }

  doQuery(): boolean {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error('Method not implemented.');
  }
}

export class MemoryJournalRepository
  extends MemoryRepository<Journal, JournalValue, JournalQuery>
  implements JournalRepository
{
  doCompare(): number {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error('Method not implemented.');
  }

  doQuery(): boolean {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error('Method not implemented.');
  }
}

export class MemoryUserRepository extends MemoryRepository<User, UserValue, UserQuery> implements UserRepository {
  doCompare(): number {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error('Method not implemented.');
  }

  doQuery(): boolean {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error('Method not implemented.');
  }
}

export const initMemoryRepositories = async () => {
  container.register('AccountRepository', { useValue: new MemoryAccountRepository() });
  container.register('FinRecordRepository', { useValue: new MemoryFinRecordRepository() });
  container.register('GroupRepository', { useValue: new MemoryGroupRepository() });
  container.register('JournalRepository', { useValue: new MemoryJournalRepository() });
  container.register('UserRepository', { useValue: new MemoryUserRepository() });
};
