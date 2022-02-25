import AbstractRepository from '../../shared/abstract-repository';
import { Account } from './account';
import { AccountValue } from './account-value';
import { AccountQuery } from './account-query';

export { Strategy, AccountType, AccountCreateOptions, Account } from './account';
export { AccountCommand, AccountCommandCreate, AccountCommandUpdate, AccountCommandDelete } from './account-command';
export { AccountQuery, AccountQueryByJournal, AccountQueryFullText } from './account-query';
export { default as AccountService } from './account-service';
export { AccountValue } from './account-value';

export type AccountRepository = AbstractRepository<Account, AccountValue, AccountQuery>;
