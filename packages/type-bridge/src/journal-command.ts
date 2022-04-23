import type { AccessItemValue } from "./journal-value";
import type { UpdateNullableValue } from "./index";

export interface JournalCommandCreate {
  readonly type: "JournalCommandCreate";

  readonly name: string;

  readonly description: string;

  readonly admins: AccessItemValue[];

  readonly members: AccessItemValue[];

  readonly startDate?: Date;

  readonly endDate?: Date;
}

export interface JournalCommandUpdate {
  readonly type: "JournalCommandUpdate";

  readonly id: string;

  readonly name?: string;

  readonly description?: string;

  readonly admins?: AccessItemValue[];

  readonly members?: AccessItemValue[];

  readonly startDate?: UpdateNullableValue<Date>;

  readonly endDate?: UpdateNullableValue<Date>;
}

export interface JournalCommandDelete {
  readonly type: "JournalCommandDelete";

  readonly id: string;
}

export type JournalCommand =
  | JournalCommandCreate
  | JournalCommandUpdate
  | JournalCommandDelete;
