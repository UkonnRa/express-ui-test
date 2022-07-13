import { AccessItemApi } from "@white-rabbit/frontend-api";
import { inject, singleton } from "tsyringe";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { User } from "oidc-client-ts";
import {
  AccessItemQuery,
  AccessItemTypeValue,
  AccessItemValue,
  FindInput,
} from "@white-rabbit/types";
import { AccessItemType } from "../proto/access-item";
import {
  AccessItemServiceClient,
  IAccessItemServiceClient,
} from "../proto/access-item.client";
import { StringValue } from "../proto/google/protobuf/wrappers";

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
    { query }: FindInput<AccessItemQuery>
  ): Promise<AccessItemValue[]> {
    const input = StringValue.create();
    if (query != null) {
      input.value = JSON.stringify(query);
    }
    const call = this.client.findAll(input, {
      meta: {
        authentication: token.access_token,
      },
    });
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
