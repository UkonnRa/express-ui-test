import { FinItemValue } from './fin-record-value';

export type FinRecordCommandCreate = {
  readonly type: 'FinRecordCommandCreate';
  readonly timestamp: Date;
  readonly user: string;
  readonly journal: string;
  readonly name: string;
  readonly description: string;
  readonly items: FinItemValue[];
  readonly tags: string[];
  readonly isContingent: boolean;
};

export type FinRecordCommandUpdate = {
  readonly type: 'FinRecordCommandUpdate';
  readonly id: string;
  readonly timestamp?: Date;
  readonly name?: string;
  readonly description?: string;
  readonly items?: FinItemValue[];
  readonly tags?: string[];
  readonly isContingent?: boolean;
};

export type FinRecordCommandDelete = {
  readonly type: 'FinRecordCommandDelete';

  readonly id: string;
};

export type FinRecordCommand = FinRecordCommandCreate | FinRecordCommandUpdate | FinRecordCommandDelete;
