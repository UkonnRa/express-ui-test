import {
  AccountApi,
  GroupApi,
  JournalApi,
  RecordApi,
  UserApi,
} from "@white-rabbit/frontend-api";

export type ApiService<T = unknown> = {
  readonly user: UserApi<T>;
  readonly group: GroupApi<T>;
  readonly journal: JournalApi<T>;
  readonly account: AccountApi<T>;
  readonly record: RecordApi<T>;
};

export const KEY_API_SERVICE = Symbol("KEY_API_SERVICE");

const mockApi = {
  findOne: async () => null,
  findPage: async () => ({
    pageInfo: { hasPreviousPage: false, hasNextPage: false },
    items: [],
  }),
  handle(): Promise<null> {
    return Promise.resolve(null);
  },
  handleAll(): Promise<Array<null>> {
    return Promise.resolve([]);
  },
};

export function createApi<T>(
  type: string,
  func: () => ApiService<T>
): ApiService<T> {
  switch (import.meta.env.VITE_API_TYPE) {
    case type:
      return func();
    case "mock":
      return {
        user: mockApi,
        group: mockApi,
        journal: mockApi,
        account: mockApi,
        record: mockApi,
      };
    default:
      throw new Error(
        `Invalid environment variable VITE_API_TYPE: ${
          import.meta.env.VITE_API_TYPE
        }`
      );
  }
}
