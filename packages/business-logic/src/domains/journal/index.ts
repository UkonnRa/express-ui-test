import AbstractRepository from '../../shared/abstract-repository';
import { Journal } from './journal';

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

export type JournalRepository = AbstractRepository<Journal>;
