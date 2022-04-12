import { isValid, decode } from "js-base64";
import { InvalidCursorError } from "./shared/errors";

export function cursorToId(cursor: string): string {
  if (!isValid(cursor)) {
    throw new InvalidCursorError(cursor);
  }

  return decode(cursor);
}
