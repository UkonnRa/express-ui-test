export type GroupCommandCreate = {
  readonly type: 'GroupCommandCreate';

  readonly name: string;

  readonly description: string;

  readonly admins: string[];

  readonly members: string[];
};

export type GroupCommandUpdate = {
  readonly type: 'GroupCommandUpdate';

  readonly id: string;

  readonly name?: string;

  readonly description?: string;

  readonly admins?: string[];

  readonly members?: string[];
};

export type GroupCommandDelete = {
  readonly type: 'GroupCommandDelete';

  readonly id: string;
};

export type GroupCommand = GroupCommandCreate | GroupCommandUpdate | GroupCommandDelete;
