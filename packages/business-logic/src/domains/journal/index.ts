import AbstractRepository from '../../shared/abstract-repository';
import { Journal } from './journal';
import { JournalQuery } from './journal-query';
import { JournalValue } from './journal-value';

export {
  AccessItem,
  AccessItemUser,
  AccessItemGroup,
  AccessItemType,
  AccessItemCreateOptions,
  AccessItemGroupCreateOptions,
  AccessItemUserCreateOptions,
} from './access-item';
export { AccessListCreateOptions, AccessList } from './access-list';
export { JournalCreateOptions, Journal } from './journal';

export { default as JournalService } from './journal-service';

export type AccessItemValue = { type: 'USER'; userId: string } | { type: 'GROUP'; groupId: string };

export type JournalRepository = AbstractRepository<Journal, JournalValue, JournalQuery>;
