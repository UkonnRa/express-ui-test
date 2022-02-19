export type AccessItemValue = { type: 'USER'; userId: string } | { type: 'GROUP'; groupId: string };

export type JournalCommandCreate = {
  readonly type: 'CreateJournal';

  readonly name: string;

  readonly description: string;

  readonly admins: AccessItemValue[];

  readonly members: AccessItemValue[];
};

export type JournalCommandUpdate = {
  readonly type: 'UpdateJournal';

  readonly id: string;

  readonly name?: string;

  readonly description?: string;

  readonly admins?: AccessItemValue[];

  readonly members?: AccessItemValue[];
};

export type JournalCommandDelete = {
  readonly type: 'DeleteJournal';

  readonly id: string;
};

export type JournalCommand = JournalCommandCreate | JournalCommandUpdate | JournalCommandDelete;
