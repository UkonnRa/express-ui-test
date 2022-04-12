import { QueryFullTextValue } from "../../shared/abstract-repository";

interface AccountQueryBase {
  readonly journal: string;
}

export type AccountQueryFullText = AccountQueryBase &
  QueryFullTextValue & {
    readonly type: "AccountQueryFullText";
  };

export type AccountQuery = AccountQueryFullText;
