import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { container } from "tsyringe";
import {
  GrpcAccountApi,
  GrpcGroupApi,
  GrpcJournalApi,
  GrpcRecordApi,
  GrpcUserApi,
  GrpcAccessItemApi,
} from "@white-rabbit/frontend-api-grpc";
import { ApiService, createApi } from "@white-rabbit/components";
import { User } from "oidc-client-ts";

export const apiService: ApiService<User> = createApi("grpc", () => {
  // https://github.com/grpc/grpc-web/blob/master/doc/browser-features.md#compression
  const transport = new GrpcWebFetchTransport({
    baseUrl: import.meta.env.VITE_API_URL,
  });
  container.registerInstance(GrpcWebFetchTransport, transport);
  return {
    user: container.resolve(GrpcUserApi),
    group: container.resolve(GrpcGroupApi),
    journal: container.resolve(GrpcJournalApi),
    account: container.resolve(GrpcAccountApi),
    record: container.resolve(GrpcRecordApi),
    accessItem: container.resolve(GrpcAccessItemApi),
  };
});
