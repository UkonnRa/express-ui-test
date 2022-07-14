import { AccessItemApi } from "@white-rabbit/frontend-api";
import { inject, singleton } from "tsyringe";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { User } from "oidc-client-ts";
import {
  AccessItemQuery,
  AccessItemTypeValue,
  AccessItemValue,
  FindAllInput,
} from "@white-rabbit/types";
import { AccessItemType } from "../proto/access-item";
import {
  AccessItemServiceClient,
  IAccessItemServiceClient,
} from "../proto/access-item.client";
import { sortToProto } from "./types";

const typeFromProto = (type: AccessItemType): AccessItemTypeValue => {
  switch (type) {
    case AccessItemType.USER:
      return AccessItemTypeValue.USER;
    case AccessItemType.GROUP:
      return AccessItemTypeValue.GROUP;
  }
};

@singleton()
export default class GrpcAccessItemApi implements AccessItemApi<User> {
  private readonly client: IAccessItemServiceClient;

  constructor(@inject(GrpcWebFetchTransport) transport: GrpcWebFetchTransport) {
    this.client = new AccessItemServiceClient(transport);
  }

  async findAll(
    token: User,
    { query, size, sort }: FindAllInput<AccessItemQuery>
  ): Promise<AccessItemValue[]> {
    const call = this.client.findAll(
      {
        query: query != null ? JSON.stringify(query) : undefined,
        size,
        sort: sort != null ? { sort: sortToProto(sort) } : undefined,
      },
      {
        meta: {
          authentication: token.access_token,
        },
      }
    );
    const result: AccessItemValue[] = [];
    for await (const entity of call.responses) {
      result.push({
        ...entity,
        type: typeFromProto(entity.type),
      });
    }
    return result;
  }
}
