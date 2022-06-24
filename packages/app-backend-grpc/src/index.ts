import "dotenv/config";
import "reflect-metadata";
import { container } from "tsyringe";
import { MikroORM } from "@mikro-orm/core";
import { BaseClient, Issuer } from "openid-client";
import { config } from "./mikro-orm.config";
import Server from "./server";

const main = async (): Promise<void> => {
  const orm = await MikroORM.init(config);
  container.registerInstance(MikroORM, orm);

  const issuer = await Issuer.discover(process.env.OPENID_DISCOVERY_URL ?? "");
  const oidcClient: BaseClient = new issuer.Client({
    client_id: process.env.OPENID_APP_ID ?? "",
    client_secret: process.env.OPENID_APP_SECRET,
    redirect_uris: [process.env.OPENID_CALLBACK_URL ?? ""],
    response_types: ["code"],
  });
  container.registerInstance(BaseClient, oidcClient);

  const server = container.resolve(Server);
  await server.start();
};

void main();
