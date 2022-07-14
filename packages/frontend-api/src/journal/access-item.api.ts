import {
  AccessItemQuery,
  AccessItemValue,
  FindAllInput,
} from "@white-rabbit/types";

export default interface AccessItemApi<T = unknown> {
  findAll: (
    token: T,
    query: FindAllInput<AccessItemQuery>
  ) => Promise<AccessItemValue[]>;
}
