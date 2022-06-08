import { MikroORM } from "@mikro-orm/core";
import { container } from "tsyringe";
import { config } from "../../mikro-orm.config";
import DefaultSeeder from "../../seeders/default.seeder";
import { GroupSuite, UserSuite, initBeforeAll } from "@white-rabbit/test-suite";

beforeAll(async () => {
  const orm = await MikroORM.init({
    ...config,
    type: "better-sqlite",
    dbName: "test.sqlite",
  });
  await initBeforeAll(orm, DefaultSeeder);
});

UserSuite.start();
GroupSuite.start();

afterAll(async () => {
  await container.resolve(MikroORM).close();
});
