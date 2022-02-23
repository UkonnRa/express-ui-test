import { QueryFullTextValue } from '../../shared/abstract-repository';

export type GroupQueryFullText = QueryFullTextValue & {
  readonly type: 'GroupQueryFullText';
};

export type GroupQuery = GroupQueryFullText;
