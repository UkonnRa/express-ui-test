import { EntityDTO, MikroORM } from "@mikro-orm/core";
import { type BaseClient } from "openid-client";
import {
  AbstractEntity,
  AuthUser,
  Order as CoreOrder,
  Query,
  UserEntity,
  UserService as CoreUserService,
  Command as CoreCommand,
  WriteService,
  Page,
} from "@white-rabbit/business-logic";
import { RpcInputStream, ServerCallContext } from "@protobuf-ts/runtime-rpc";
import { StringValue } from "../proto/google/protobuf/wrappers";
import { FindPageRequest, Order } from "../proto/shared";

interface NullableEntity<P> {
  item?: P;
}

export default abstract class AbstractService<
  E extends AbstractEntity<E>,
  C extends CoreCommand,
  S extends WriteService<E, C>,
  P,
  CP
> {
  protected constructor(
    private readonly orm: MikroORM,
    private readonly oidcClient: BaseClient,
    private readonly userService: CoreUserService,
    private readonly service: S
  ) {}

  abstract getCommand(command: CP): C;

  abstract getModel(entity: EntityDTO<E> | E): P;

  private getPageResponse({ pageInfo, items }: Page<E>): Page<P> {
    return {
      pageInfo,
      items: items.map(({ cursor, data }) => ({
        cursor,
        data: this.getModel(data),
      })),
    };
  }

  private getResponse(entity: EntityDTO<E> | E | null): NullableEntity<P> {
    return {
      item: entity == null ? undefined : this.getModel(entity),
    };
  }

  private async getAuthUser(context: ServerCallContext): Promise<AuthUser> {
    const { sub } = await this.oidcClient.userinfo(
      context.headers.authentication as string
    );
    const authId = {
      [process.env.OPENID_PROVIDER ?? ""]: sub,
    };
    return {
      user:
        (await this.orm.em.fork().findOne(UserEntity, { authIds: authId })) ??
        undefined,
      authId: {
        provider: process.env.OPENID_PROVIDER ?? "",
        value: sub,
      },
      scopes: [this.userService.readScope, this.userService.writeScope],
    };
  }

  async findOne(
    request: StringValue,
    context: ServerCallContext
  ): Promise<NullableEntity<P>> {
    const authUser = await this.getAuthUser(context);
    const query: Query<E> = JSON.parse(request.value);

    try {
      const entity = await this.service.findOne({
        query,
        authUser,
      });
      return this.getResponse(entity);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async findPage(
    request: FindPageRequest,
    context: ServerCallContext
  ): Promise<Page<P>> {
    const query: Query<E> =
      request.query != null ? JSON.parse(request.query) : {};
    const authUser = await this.getAuthUser(context);

    try {
      const page = await this.service.findPage({
        query,
        authUser,
        pagination: request.pagination ?? { size: 5 },
        sort: request.sort.map(({ field, order }) => ({
          field,
          order: order === Order.ASC ? CoreOrder.ASC : CoreOrder.DESC,
        })),
      });

      return this.getPageResponse(page);
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
    const query: Query<E> = JSON.parse(request.value);
    const authUser = await this.getAuthUser(context);

    const entities = await this.service.findAll({ authUser, query });
    for (const entity of entities) {
      await responses.send(this.getModel(entity));
    }
    await responses.complete();
  }

  async handle(
    request: CP,
    context: ServerCallContext
  ): Promise<NullableEntity<P>> {
    const authUser = await this.getAuthUser(context);
    const entity = await this.service.handle({
      command: this.getCommand(request),
      authUser,
    });
    return this.getResponse(entity);
  }

  async handleAll(
    request: { commands: CP[] },
    responses: RpcInputStream<NullableEntity<P>>,
    context: ServerCallContext
  ): Promise<void> {
    const authUser = await this.getAuthUser(context);
    const entities = await this.service.handleAll({
      commands: request.commands.map((command) => this.getCommand(command)),
      authUser,
    });
    for (const entity of entities) {
      await responses.send(this.getResponse(entity));
    }
    await responses.complete();
  }
}
