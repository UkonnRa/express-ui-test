import { App } from "vue";
import type { GroupApi, UserApi } from "@white-rabbit/frontend-api";
import { container } from "tsyringe";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { GrpcGroupApi, GrpcUserApi } from "@white-rabbit/frontend-api-grpc";

type Api = { user: UserApi; group: GroupApi };

const SYMBOL_API = Symbol("API");

export { type Api, SYMBOL_API };

export default function (app: App): void {
  if (import.meta.env.VITE_API_TYPE === "grpc") {
    const transport = new GrpcWebFetchTransport({
      baseUrl: import.meta.env.VITE_API_URL,
    });
    container.registerInstance(GrpcWebFetchTransport, transport);
    app.provide<Api>(SYMBOL_API, {
      user: container.resolve(GrpcUserApi),
      group: container.resolve(GrpcGroupApi),
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
    app.provide<Api>(SYMBOL_API, {
      user: mockApi,
      group: mockApi,
    });
  } else {
    throw new Error(
      `Invalid environment variable VITE_API_TYPE: ${
        import.meta.env.VITE_API_TYPE
      }`
    );
  }
}
