import { QueryFullTextValue } from "../../shared/abstract-repository";
import { AccountType, Strategy } from "./account";

export type AccountQueryFullText = QueryFullTextValue & {
  readonly type: "AccountQueryFullText";
};

export interface AccountQueryByJournal {
  readonly type: "AccountQueryByJournal";

  readonly journal: string;

  readonly accountType?: AccountType;

  readonly unit?: string;

  readonly strategy?: Strategy;
}

export type AccountQuery = AccountQueryFullText | AccountQueryByJournal;
