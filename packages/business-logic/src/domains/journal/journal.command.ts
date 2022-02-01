export type AccessItemValue = { type: 'USER'; userId: string } | { type: 'GROUP'; groupId: string };

export type JournalCommandCreate = {
  readonly type: 'CreateJournal';

  readonly name: string;

  readonly description: string;

  readonly admins: AccessItemValue[];

  readonly members: AccessItemValue[];
};

export type JournalCommand = JournalCommandCreate;
