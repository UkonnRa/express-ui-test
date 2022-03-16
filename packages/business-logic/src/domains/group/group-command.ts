export interface GroupCommandCreate {
  readonly type: "GroupCommandCreate";

  readonly name: string;

  readonly description: string;

  readonly admins: string[];

  readonly members: string[];
}

export interface GroupCommandUpdate {
  readonly type: "GroupCommandUpdate";

  readonly id: string;

  readonly name?: string;

  readonly description?: string;

  readonly admins?: string[];

  readonly members?: string[];
}

export interface GroupCommandDelete {
  readonly type: "GroupCommandDelete";

  readonly id: string;
}

export type GroupCommand =
  | GroupCommandCreate
  | GroupCommandUpdate
  | GroupCommandDelete;
