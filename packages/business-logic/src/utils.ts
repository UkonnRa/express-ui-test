import { decode, encodeURL } from "js-base64";
import { Cursor, FullTextQuery } from "@white-rabbit/types";
import { AccessItemValue } from "./journal";

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

export const accessItemsContain = async (
  accessItems: AccessItemValue[],
  userId: string
): Promise<boolean> => {
  for (const item of accessItems) {
    if (await item.contains(userId)) {
      return true;
    }
  }
  return false;
};

export const fullTextSearch = <E>(entity: E, query: FullTextQuery): boolean =>
  query.fields.some((field): boolean => {
    const value = entity[field as keyof E];
    if (typeof value === "string") {
      return value.includes(query.value);
    } else if (value instanceof Array) {
      return value.some(
        (item) => typeof item === "string" && item.includes(query.value)
      );
    }
    return false;
  });
