import { AccessItemValue } from './index';

export type KeywordValue = {
  fields?: string[];
  value: string;
};

export type JournalQueryFulltext = {
  readonly type: 'JournalQueryFulltext';

  readonly keyword: KeywordValue;
};

export type JournalQueryAccessItem = {
  readonly type: 'JournalQueryAccessItem';

  readonly accessItem: AccessItemValue;
};

export type JournalQuery = JournalQueryFulltext | JournalQueryAccessItem;
