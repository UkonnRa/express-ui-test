/* eslint-disable @typescript-eslint/no-explicit-any */
import { Base64 } from "js-base64";
import { InvalidCursorError } from "./shared/errors";

export type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

export function cursorToId(cursor: string): string {
  if (!Base64.isValid(cursor)) {
    throw new InvalidCursorError(cursor);
  }

  return Base64.decode(cursor);
}
