import type {
  AccessItemQuery,
  AccessItemValue,
} from "@white-rabbit/type-bridge";
import type { ReadApi } from "./index";

export type AccessItemApi = ReadApi<AccessItemValue, AccessItemQuery>;

export const ACCESS_ITEM_API_KEY = Symbol("ACCESS_ITEM_API_KEY");
