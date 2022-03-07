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

export type AccessItemValue = { type: 'USER'; userId: string } | { type: 'GROUP'; groupId: string };
