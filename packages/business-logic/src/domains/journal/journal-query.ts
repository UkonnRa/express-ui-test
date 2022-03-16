import { QueryFullTextValue } from "../../shared/abstract-repository";
import { AccessItemValue } from "./index";

export type JournalQueryFullText = QueryFullTextValue & {
  readonly type: "JournalQueryFullText";
};

export interface JournalQueryAccessItem {
  readonly type: "JournalQueryAccessItem";

  readonly accessItem: AccessItemValue;
}

export type JournalQuery = JournalQueryFullText | JournalQueryAccessItem;
