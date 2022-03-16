import { QueryFullTextValue } from "../../shared/abstract-repository";

interface FinRecordQueryBase {
  readonly journal: string;
}

export type FinRecordQueryFullText = QueryFullTextValue &
  FinRecordQueryBase & {
    readonly type: "FinRecordQueryFullText";
  };

export type FinRecordQueryTimeRange = FinRecordQueryBase & {
  readonly type: "FinRecordQueryTimeRange";
  readonly from: Date;
  readonly to: Date;
};

export type FinRecordQuery = FinRecordQueryFullText | FinRecordQueryTimeRange;
