import { MikroORM } from "@mikro-orm/core";
import { container } from "tsyringe";
import {
  GroupSuite,
  UserSuite,
  initBeforeAll,
  JournalSuite,
} from "@white-rabbit/test-suite";
import { config } from "../../mikro-orm.config";
import DefaultSeeder from "../../seeders/default.seeder";

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
JournalSuite.start();

afterAll(async () => {
  await container.resolve(MikroORM).close();
});
