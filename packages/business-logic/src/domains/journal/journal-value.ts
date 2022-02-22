import { AccessItemValue } from './index';

export interface JournalValue {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly admins: AccessListValue;
  readonly members: AccessListValue;
}

export interface AccessListValue {
  readonly items: AccessItemValue[];
}
