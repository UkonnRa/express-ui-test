import {
  Command,
  FindInput,
  FindPageInput,
  Order,
  Page,
  PageItem,
  Sort,
} from "@white-rabbit/types";
import { User } from "oidc-client-ts";
import { StringValue } from "../proto/google/protobuf/wrappers";
import { Order as OrderProto, Sort as SortProto } from "../proto/shared";
import AbstractClient from "./abstract-client";
import { PageProto } from "./types";

function sortToProto({ field, order }: Sort): SortProto {
  return {
    field,
    order: order === Order.ASC ? OrderProto.ASC : OrderProto.DESC,
  };
}

export default abstract class AbstractApi<
  M,
  C extends Command,
  Q,
  P extends object,
  CP extends object,
  ClientP extends AbstractClient<P, CP>
> {
  protected constructor(private readonly client: ClientP) {}

  protected abstract modelFromProto(model: P): M;

  protected abstract commandToProto(command: C): CP;

  private pageFromProto(page: PageProto<P>): Page<M> {
    return {
      ...page,
      pageInfo: {
        ...page.pageInfo,
        hasPreviousPage: page.pageInfo?.hasPreviousPage ?? false,
        hasNextPage: page.pageInfo?.hasNextPage ?? false,
      },
      items: page.items
        .map(({ cursor, data }) =>
          data != null
            ? {
                cursor,
                data: this.modelFromProto(data),
              }
            : null
        )
        .filter((item): item is PageItem<M> => item != null),
    };
  }

  async findOne(token: User, { query }: FindInput<Q>): Promise<M | null> {
    const params = StringValue.create();
    if (query != null) {
      params.value = JSON.stringify(query);
    }
    const call = await this.client.findOne(params, {
      meta: {
        authentication: token.access_token,
      },
    });
    return call.response.item == null
      ? null
      : this.modelFromProto(call.response.item);
  }

  async findPage(
    token: User,
    { sort, query, pagination }: FindPageInput<Q>
  ): Promise<Page<M>> {
    const call = await this.client.findPage(
      {
        sort: sort.map((item) => sortToProto(item)),
        query: query == null ? undefined : JSON.stringify(query),
        pagination,
      },
      {
        meta: { authentication: token.access_token },
      }
    );
    return this.pageFromProto(call.response);
  }

  async handle(token: User, command: C): Promise<M | null> {
    const call = await this.client.handle(this.commandToProto(command), {
      meta: { authentication: token.access_token },
    });
    return call.response.item == null
      ? null
      : this.modelFromProto(call.response.item);
  }

  async handleAll(token: User, commands: C[]): Promise<Array<M | null>> {
    const call = this.client.handleAll(
      { commands: commands.map((command) => this.commandToProto(command)) },
      {
        meta: { authentication: token.access_token },
      }
    );
    const result = [];
    for await (const entity of call.responses) {
      result.push(
        entity.item == null ? null : this.modelFromProto(entity.item)
      );
    }
    return result;
  }
}
