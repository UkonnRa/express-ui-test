import {
  AccessItemQuery,
  AccessItemValue,
  FindInput,
} from "@white-rabbit/types";

export default interface AccessItemApi<T = unknown> {
  findAll: (
    token: T,
    query: FindInput<AccessItemQuery>
  ) => Promise<AccessItemValue[]>;
}
