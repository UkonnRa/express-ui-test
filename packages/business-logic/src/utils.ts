import { decode, encodeURL } from "js-base64";
import Cursor from "./shared/cursor";

export async function mapAsync<T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<U>
): Promise<U[]> {
  return Promise.all(array.map(callbackfn));
}

export async function filterAsync<T>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>
): Promise<T[]> {
  const filterMap = await mapAsync(array, callbackfn);
  return array.filter((_, index) => filterMap[index]);
}

export function decodeCursor(cursor: string): Cursor {
  return JSON.parse(decode(cursor));
}

export function encodeCursor(cursor: Cursor): string {
  return encodeURL(JSON.stringify(cursor));
}
