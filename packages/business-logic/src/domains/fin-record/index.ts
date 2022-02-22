import AbstractRepository from '../../shared/abstract-repository';
import { Account } from './account';
import { FinRecord } from './fin-record';

export { Strategy, AccountType, AccountCreateOptions, Account } from './account';
export { FinRecordCreateOptions, FinRecord } from './fin-record';

export type AccountRepository = AbstractRepository<Account, unknown, unknown>;
export type FinRecordRepository = AbstractRepository<FinRecord, unknown, unknown>;
