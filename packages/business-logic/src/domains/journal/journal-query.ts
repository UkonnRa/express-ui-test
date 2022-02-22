import { AccessItemValue } from './index';
import { QueryFullTextValue } from '../../shared/abstract-repository';

export type JournalQueryFullText = QueryFullTextValue & {
  readonly type: 'JournalQueryFullText';
};

export type JournalQueryAccessItem = {
  readonly type: 'JournalQueryAccessItem';

  readonly accessItem: AccessItemValue;
};

export type JournalQuery = JournalQueryFullText | JournalQueryAccessItem;
