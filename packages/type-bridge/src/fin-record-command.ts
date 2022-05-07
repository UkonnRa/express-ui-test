import type { FinItemValue } from "./fin-record-value";

export interface FinRecordCommandCreate {
  readonly type: "FinRecordCommandCreate";
  readonly timestamp: Date;
  readonly journal: string;
  readonly name: string;
  readonly description: string;
  readonly items: FinItemValue[];
  readonly tags: string[];
  readonly isContingent: boolean;
}

export interface FinRecordCommandUpdate {
  readonly type: "FinRecordCommandUpdate";
  readonly id: string;
  readonly timestamp?: Date;
  readonly name?: string;
  readonly description?: string;
  readonly items?: FinItemValue[];
  readonly tags?: string[];
  readonly isContingent?: boolean;
}

export interface FinRecordCommandDelete {
  readonly type: "FinRecordCommandDelete";

  readonly id: string;
}

export type FinRecordCommand =
  | FinRecordCommandCreate
  | FinRecordCommandUpdate
  | FinRecordCommandDelete;
