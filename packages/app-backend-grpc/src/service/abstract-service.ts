import { EntityDTO, EntityManager } from "@mikro-orm/core";
import { AuthUser, UserEntity } from "@white-rabbit/business-logic";
import { ServerCallContext } from "@protobuf-ts/runtime-rpc";
import jwksRsa from "jwks-rsa";
import jwt, {
  GetPublicKeyOrSecret,
  Jwt,
  JwtHeader,
  SigningKeyCallback,
} from "jsonwebtoken";

export interface NullableEntity<P> {
  item?: P;
}

export default abstract class AbstractService<E, P> {
  private readonly jwksClient = jwksRsa({
    jwksUri: process.env.OPENID_JWKS_KEYS_URL ?? "",
  });

  abstract getModel(
    entity: EntityDTO<E> | E,
    em: EntityManager,
    authUser: AuthUser
  ): Promise<P>;

  protected readonly getJwtKey: GetPublicKeyOrSecret = (
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

  protected async getAuthUser(
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
}
