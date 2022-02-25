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
export { JournalCommand, JournalCommandCreate, JournalCommandUpdate, JournalCommandDelete } from './journal-command';
export { JournalQuery, JournalQueryAccessItem, JournalQueryFullText } from './journal-query';
export { default as JournalService } from './journal-service';
export { JournalValue, AccessListValue } from './journal-value';
export type AccessItemValue = { type: 'USER'; userId: string } | { type: 'GROUP'; groupId: string };
export type JournalRepository = AbstractRepository<Journal, JournalValue, JournalQuery>;
