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
import MemoryRepository from './memory-repository';

export class MemoryAccountRepository extends MemoryRepository<Account> implements AccountRepository {}

export class MemoryFinRecordRepository extends MemoryRepository<FinRecord> implements FinRecordRepository {}

export class MemoryGroupRepository extends MemoryRepository<Group> implements GroupRepository {}

export class MemoryJournalRepository extends MemoryRepository<Journal> implements JournalRepository {}

export class MemoryUserRepository extends MemoryRepository<User> implements UserRepository {}

export const initMemoryRepositories = async () => {
  container.register('AccountRepository', { useValue: new MemoryAccountRepository() });
  container.register('FinRecordRepository', { useValue: new MemoryFinRecordRepository() });
  container.register('GroupRepository', { useValue: new MemoryGroupRepository() });
  container.register('JournalRepository', { useValue: new MemoryJournalRepository() });
  container.register('UserRepository', { useValue: new MemoryUserRepository() });
};
