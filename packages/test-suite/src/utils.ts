import { MikroORM } from "@mikro-orm/core";
import { ISeedManager } from "@mikro-orm/core/typings";
import { container } from "tsyringe";

export const initBeforeAll = async (
  orm: MikroORM,
  ...seeders: Parameters<ISeedManager["seed"]>
): Promise<void> => {
  container.registerInstance(MikroORM, orm);
  const seeder = orm.getSeeder();
  await orm.getSchemaGenerator().refreshDatabase();
  await seeder.seed(...seeders);
};
