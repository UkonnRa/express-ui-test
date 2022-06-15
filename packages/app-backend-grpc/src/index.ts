import "reflect-metadata";
import { container } from "tsyringe";
import { MikroORM } from "@mikro-orm/core";
import { config } from "./mikro-orm.config";
import Server from "./server";

const main = async (): Promise<void> => {
  const orm = await MikroORM.init(config);
  container.registerInstance(MikroORM, orm);
  const server = container.resolve(Server);
  await server.start();
};

void main();
