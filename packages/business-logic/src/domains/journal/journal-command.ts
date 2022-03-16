import { AccessItemValue } from "./index";

export interface JournalCommandCreate {
  readonly type: "CreateJournal";

  readonly name: string;

  readonly description: string;

  readonly admins: AccessItemValue[];

  readonly members: AccessItemValue[];
}

export interface JournalCommandUpdate {
  readonly type: "UpdateJournal";

  readonly id: string;

  readonly name?: string;

  readonly description?: string;

  readonly admins?: AccessItemValue[];

  readonly members?: AccessItemValue[];
}

export interface JournalCommandDelete {
  readonly type: "DeleteJournal";

  readonly id: string;
}

export type JournalCommand =
  | JournalCommandCreate
  | JournalCommandUpdate
  | JournalCommandDelete;
