import type { TYPE_USER } from "./user-value";
import type { TYPE_GROUP } from "./group-value";

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

export type AccessItemType = typeof TYPE_USER | typeof TYPE_GROUP;

export interface AccessItemValue {
  readonly type: AccessItemType;
  readonly id: string;
  readonly name: string;
}
