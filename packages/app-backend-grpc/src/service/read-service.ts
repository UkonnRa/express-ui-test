import { Order as CoreOrder, Page } from "@white-rabbit/types";
import { EntityDTO, EntityManager, MikroORM } from "@mikro-orm/core";
import {
  AbstractEntity,
  AuthUser,
  ReadService as OriginalReadService,
} from "@white-rabbit/business-logic";
import { RpcInputStream, ServerCallContext } from "@protobuf-ts/runtime-rpc";
import { StringValue } from "../proto/google/protobuf/wrappers";
import { FindPageRequest, Order } from "../proto/shared";
import AbstractService, { NullableEntity } from "./abstract-service";

export default abstract class ReadService<
  E extends AbstractEntity<E>,
  Q,
  S extends OriginalReadService<E, Q>,
  P
> extends AbstractService<E, P> {
  protected constructor(
    protected readonly orm: MikroORM,
    protected readonly service: S
  ) {
    super();
  }

  private async getPageResponse(
    { pageInfo, items }: Page<E>,
    em: EntityManager,
    authUser: AuthUser
  ): Promise<Page<P>> {
    return {
      pageInfo,
      items: await Promise.all(
        items.map(async ({ cursor, data }) => ({
          cursor,
          data: await this.getModel(data, em, authUser),
        }))
      ),
    };
  }

  protected async getResponse(
    entity: EntityDTO<E> | E | null,
    em: EntityManager,
    authUser: AuthUser
  ): Promise<NullableEntity<P>> {
    return {
      item:
        entity == null ? undefined : await this.getModel(entity, em, authUser),
    };
  }

  async findOne(
    request: StringValue,
    context: ServerCallContext
  ): Promise<NullableEntity<P>> {
    const em = this.orm.em.fork();
    const authUser = await this.getAuthUser(context, em);
    const query: Q = JSON.parse(request.value);

    try {
      const entity = await this.service.findOne(
        {
          query,
          authUser,
        },
        em
      );
      return this.getResponse(entity, em, authUser);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async findPage(
    request: FindPageRequest,
    context: ServerCallContext
  ): Promise<Page<P>> {
    const em = this.orm.em.fork();
    const query: Q = request.query != null ? JSON.parse(request.query) : {};
    const authUser = await this.getAuthUser(context, em);

    try {
      const page = await this.service.findPage(
        {
          query,
          authUser,
          pagination: request.pagination ?? { size: 5 },
          sort: request.sort.map(({ field, order }) => ({
            field,
            order: order === Order.ASC ? CoreOrder.ASC : CoreOrder.DESC,
          })),
        },
        em
      );

      return this.getPageResponse(page, em, authUser);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async findAll(
    request: StringValue,
    responses: RpcInputStream<P>,
    context: ServerCallContext
  ): Promise<void> {
    const query: Q = JSON.parse(request.value);
    const em = this.orm.em.fork();
    const authUser = await this.getAuthUser(context, em);

    const entities = await this.service.findAll({ authUser, query }, em);
    for (const entity of entities) {
      await responses.send(await this.getModel(entity, em, authUser));
    }
    await responses.complete();
  }
}
