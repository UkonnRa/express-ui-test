import { App } from "vue";
import type {
  AccountApi,
  GroupApi,
  JournalApi,
  RecordApi,
  UserApi,
} from "@white-rabbit/frontend-api";
import { container } from "tsyringe";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import {
  GrpcAccountApi,
  GrpcGroupApi,
  GrpcJournalApi,
  GrpcRecordApi,
  GrpcUserApi,
} from "@white-rabbit/frontend-api-grpc";

type Api = {
  readonly user: UserApi;
  readonly group: GroupApi;
  readonly journal: JournalApi;
  readonly account: AccountApi;
  readonly record: RecordApi;
};

const KEY_API = Symbol("API");

export { type Api, KEY_API };

export default function (app: App): void {
  if (import.meta.env.VITE_API_TYPE === "grpc") {
    const transport = new GrpcWebFetchTransport({
      baseUrl: import.meta.env.VITE_API_URL,
    });
    container.registerInstance(GrpcWebFetchTransport, transport);
    app.provide<Api>(KEY_API, {
      user: container.resolve(GrpcUserApi),
      group: container.resolve(GrpcGroupApi),
      journal: container.resolve(GrpcJournalApi),
      account: container.resolve(GrpcAccountApi),
      record: container.resolve(GrpcRecordApi),
    });
  } else if (import.meta.env.VITE_API_TYPE === "mock") {
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
    app.provide<Api>(KEY_API, {
      user: mockApi,
      group: mockApi,
      journal: mockApi,
      account: mockApi,
      record: mockApi,
    });
  } else {
    throw new Error(
      `Invalid environment variable VITE_API_TYPE: ${
        import.meta.env.VITE_API_TYPE
      }`
    );
  }
}
