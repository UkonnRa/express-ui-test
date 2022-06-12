import "reflect-metadata";
import { container } from "tsyringe";
import { MikroORM } from "@mikro-orm/core";
import DefaultSeeder from "../business-logic/seeders/default.seeder";
import { config } from "./src/mikro-orm.config";

const main = async (): Promise<void> => {
  const orm = await MikroORM.init(config);

  container.registerInstance(MikroORM, orm);
  const seeder = orm.getSeeder();
  await orm.getSchemaGenerator().refreshDatabase();
  await seeder.seed(DefaultSeeder);
};

void main().then(() => process.exit(0));
