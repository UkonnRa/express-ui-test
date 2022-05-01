import type { AccessItemType } from "./journal-value";

export interface AccessItemQuery {
  readonly type: "AccessItemQuery";
  readonly keyword: string;
  readonly accessItemType?: AccessItemType;
}
