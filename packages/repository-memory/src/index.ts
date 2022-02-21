import { Journal, JournalRepository } from '@white-rabbit/business-logic/src/domains/journal';
import {
  Account,
  AccountRepository,
  FinRecord,
  FinRecordRepository,
} from '@white-rabbit/business-logic/src/domains/fin-record';
import { Group, GroupRepository } from '@white-rabbit/business-logic/src/domains/group';
import { User, UserRepository } from '@white-rabbit/business-logic/src/domains/user';
import { container } from 'tsyringe';
import { JournalProjection } from '@white-rabbit/business-logic/src/domains/journal/journal-projection';
import { JournalQuery } from '@white-rabbit/business-logic/src/domains/journal/journal-query';
import MemoryRepository from './memory-repository';

export class MemoryAccountRepository extends MemoryRepository<Account, never, never> implements AccountRepository {}

export class MemoryFinRecordRepository
  extends MemoryRepository<FinRecord, never, never>
  implements FinRecordRepository {}

export class MemoryGroupRepository extends MemoryRepository<Group, never, never> implements GroupRepository {}

export class MemoryJournalRepository
  extends MemoryRepository<Journal, JournalProjection, JournalQuery>
  implements JournalRepository {}

export class MemoryUserRepository extends MemoryRepository<User, never, never> implements UserRepository {}

export const initMemoryRepositories = async () => {
  container.register('AccountRepository', { useValue: new MemoryAccountRepository() });
  container.register('FinRecordRepository', { useValue: new MemoryFinRecordRepository() });
  container.register('GroupRepository', { useValue: new MemoryGroupRepository() });
  container.register('JournalRepository', { useValue: new MemoryJournalRepository() });
  container.register('UserRepository', { useValue: new MemoryUserRepository() });
};
