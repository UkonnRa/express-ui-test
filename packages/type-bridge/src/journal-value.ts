export const TYPE_JOURNAL = Symbol("Journal");

export interface JournalValue {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly admins: AccessItemValue[];
  readonly members: AccessItemValue[];
  readonly archived: boolean;
}

export interface AccessItemValue {
  readonly type: symbol;
  readonly id: string;
}
