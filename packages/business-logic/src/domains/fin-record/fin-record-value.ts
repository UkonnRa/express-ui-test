import { FinRecordState } from './fin-record';

export interface FinRecordValue {
  readonly id: string;
  readonly timestamp: Date;
  readonly user: string;
  readonly journal: string;
  readonly name: string;
  readonly description: string;
  readonly items: FinItemValue[];
  readonly tags: string[];
  readonly isContingent: boolean;
  readonly state: FinRecordState;
}

export interface FinItemValue {
  readonly account: string;
  readonly amount: number;
  readonly unit?: string;
  readonly price?: number;
  readonly note?: string;
}
