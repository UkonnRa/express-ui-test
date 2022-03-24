import { AccessItemValue } from "./index";

export interface JournalCommandCreate {
  readonly type: "JournalCommandCreate";

  readonly name: string;

  readonly description: string;

  readonly admins: AccessItemValue[];

  readonly members: AccessItemValue[];
}

export interface JournalCommandUpdate {
  readonly type: "JournalCommandUpdate";

  readonly id: string;

  readonly name?: string;

  readonly description?: string;

  readonly admins?: AccessItemValue[];

  readonly members?: AccessItemValue[];
}

export interface JournalCommandDelete {
  readonly type: "JournalCommandDelete";

  readonly id: string;
}

export type JournalCommand =
  | JournalCommandCreate
  | JournalCommandUpdate
  | JournalCommandDelete;