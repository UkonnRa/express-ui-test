export const TYPE_FIN_RECORD = Symbol("FinRecord");
export const TYPE_FIN_ITEM = Symbol("FinItem");

export enum FinRecordState {
  NORMAL,
  NOT_ZERO_OUT,
  UNITS_NOT_MATCH,
}

export interface FinRecordValue {
  readonly id: string;
  readonly timestamp: Date;
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

export type TimeSeriesAggregateValue = TimeSeriesItemValue[];

export interface TimeSeriesItemValue {
  readonly timestamp: Date;
  readonly items: TimeSeriesPerUnitItem[];
}

export interface TimeSeriesPerUnitItem {
  readonly unit: string;
  readonly amount: number;
}

export interface AccountHierarchyValue {
  readonly accountName: string;
  readonly unit: string;
  readonly amount: string;
  readonly children: AccountHierarchyItemValue[];
}

export interface AccountHierarchyItemValue {
  readonly accountName: string;
  readonly amount: string;
  readonly children?: AccountHierarchyItemValue[];
}

export type AccountAggregateValue = Array<
  Omit<AccountHierarchyValue, "children">
>;

export interface SumItemValue {
  readonly unit: string;
  readonly amount: number;
}

export type SumValue = SumItemValue[];
