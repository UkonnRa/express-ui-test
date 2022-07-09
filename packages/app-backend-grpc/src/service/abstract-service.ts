import { EntityDTO, EntityManager, MikroORM } from "@mikro-orm/core";
import {
  AbstractEntity,
  AuthUser,
  UserEntity,
  WriteService,
} from "@white-rabbit/business-logic";
import {
  Page,
  Command as CoreCommand,
  Order as CoreOrder,
} from "@white-rabbit/types";
import { RpcInputStream, ServerCallContext } from "@protobuf-ts/runtime-rpc";
import jwksRsa from "jwks-rsa";
import jwt, {
  GetPublicKeyOrSecret,
  Jwt,
  JwtHeader,
  SigningKeyCallback,
} from "jsonwebtoken";
import { StringValue } from "../proto/google/protobuf/wrappers";
import { FindPageRequest, Order } from "../proto/shared";

interface NullableEntity<P> {
  item?: P;
}

export default abstract class AbstractService<
  E extends AbstractEntity<E>,
  C extends CoreCommand,
  Q,
  S extends WriteService<E, C, Q>,
  P,
  CP
> {
  private readonly jwksClient = jwksRsa({
    jwksUri: process.env.OPENID_JWKS_KEYS_URL ?? "",
  });

  protected constructor(
    private readonly orm: MikroORM,
    protected readonly service: S
  ) {}

  abstract getCommand(command: CP): C;

  abstract getModel(
    entity: EntityDTO<E> | E,
    em: EntityManager,
    authUser: AuthUser
  ): Promise<P>;

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

  private async getResponse(
    entity: EntityDTO<E> | E | null,
    em: EntityManager,
    authUser: AuthUser
  ): Promise<NullableEntity<P>> {
    return {
      item:
        entity == null ? undefined : await this.getModel(entity, em, authUser),
    };
  }

  private readonly getJwtKey: GetPublicKeyOrSecret = (
    header: JwtHeader,
    callback: SigningKeyCallback
  ) => {
    this.jwksClient.getSigningKey(header.kid, function (err, key) {
      if (err != null || key == null) {
        callback(err, undefined);
      } else {
        callback(null, key.getPublicKey());
      }
    });
  };

  private async getAuthUser(
    context: ServerCallContext,
    em: EntityManager
  ): Promise<AuthUser> {
    const jwtToken = await new Promise<Jwt | undefined>((resolve, reject) => {
      jwt.verify(
        context.headers.authentication as string,
        this.getJwtKey,
        { algorithms: ["RS256"], complete: true },
        (err, decoded) => {
          if (err != null) {
            reject(err);
          } else {
            resolve(decoded);
          }
        }
      );
    });

    if (jwtToken == null || typeof jwtToken.payload === "string") {
      throw new Error("Invalid Token");
    }

    const authId = {
      [process.env.OPENID_PROVIDER ?? ""]: jwtToken.payload.sub,
    };
    return {
      user: (await em.findOne(UserEntity, { authIds: authId })) ?? undefined,
      authId: {
        provider: process.env.OPENID_PROVIDER ?? "",
        value: jwtToken.payload.sub ?? "",
      },
      scopes: jwtToken.payload.scope?.split(" "),
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

  async handle(
    request: CP,
    context: ServerCallContext
  ): Promise<NullableEntity<P>> {
    const em = this.orm.em.fork();
    const authUser = await this.getAuthUser(context, em);
    const entity = await this.service.handle(
      {
        command: this.getCommand(request),
        authUser,
      },
      em
    );
    return this.getResponse(entity, em, authUser);
  }

  async handleAll(
    request: { commands: CP[] },
    responses: RpcInputStream<NullableEntity<P>>,
    context: ServerCallContext
  ): Promise<void> {
    const em = this.orm.em.fork();
    const authUser = await this.getAuthUser(context, em);
    const entities = await this.service.handleAll(
      {
        commands: request.commands.map((command) => this.getCommand(command)),
        authUser,
      },
      em
    );
    for (const entity of entities) {
      await responses.send(await this.getResponse(entity, em, authUser));
    }
    await responses.complete();
  }
}
