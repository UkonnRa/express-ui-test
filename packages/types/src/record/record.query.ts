import { FULL_TEXT_OPERATOR } from "../shared";
import RecordTypeValue from "./record-type.value";

export default interface RecordQuery {
  readonly [FULL_TEXT_OPERATOR]?: string;
  readonly id?: string | string[];
  readonly journal?: string;
  readonly name?: string | { readonly [FULL_TEXT_OPERATOR]?: string };
  readonly description?: string;
  readonly type?: RecordTypeValue;
  readonly timestamp?: { readonly $gt?: Date; readonly $lt?: Date };
  readonly tags: string | string[] | { readonly [FULL_TEXT_OPERATOR]?: string };
}
