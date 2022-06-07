import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { config } from "../../../mikro-orm.config";
import DefaultSeeder from "../../../seeders/default.seeder";
import { container } from "tsyringe";
import { RoleValue, UserEntity, UserService } from "../../user";
import Order from "../order";
import PageItem from "../page-item";
import { USER_READ_SCOPE } from "../../user/user.service";
import AuthUser from "../auth-user";

beforeAll(async () => {
  const orm = await MikroORM.init({
    ...config,
    type: "better-sqlite",
    dbName: "test.sqlite",
  });
  container.registerInstance(MikroORM, orm);
  const seeder = orm.getSeeder();
  await orm.getSchemaGenerator().refreshDatabase();
  await seeder.seed(DefaultSeeder);
});

test("Find first 3 admins", async () => {
  const orm = container.resolve(MikroORM);
  const em = orm.em.fork();
  const userService = container.resolve(UserService);
  const authUserValue = await em.findOneOrFail(UserEntity, {
    role: RoleValue.OWNER,
  });
  const authUser: AuthUser = {
    authId: authUserValue.authIds[0],
    user: authUserValue,
    scopes: [USER_READ_SCOPE],
  };

  const doCheckItems = (items: Array<PageItem<UserEntity>>): void => {
    let prevName: string | null = null;
    for (const admin of items) {
      expect(admin.data.role).toBe(RoleValue.ADMIN);
      if (prevName != null) {
        expect(admin.data.name.localeCompare(prevName)).toBeGreaterThan(0);
      }
      prevName = admin.data.name;
    }
  };

  const page = await userService.findAll({
    authUser,
    query: { role: RoleValue.ADMIN },
    pagination: { size: 3 },
    sort: [{ field: "name", order: Order.ASC }],
  });
  doCheckItems(page.items);

  expect(page.pageInfo.hasPreviousPage).toBeFalsy();
  expect(page.pageInfo.hasNextPage).toBeTruthy();
  expect(page.items.length).toBe(3);
  const nextPage = await userService.findAll({
    authUser,
    query: { role: RoleValue.ADMIN },
    pagination: { size: 3, after: page.pageInfo.endCursor },
    sort: [{ field: "name", order: Order.ASC }],
  });
  doCheckItems([...page.items, ...nextPage.items]);

  const nextPagePrevious = await userService.findAll({
    authUser,
    query: { role: RoleValue.ADMIN },
    pagination: { size: 3, before: nextPage.pageInfo.startCursor },
    sort: [{ field: "name", order: Order.ASC }],
  });
  expect(nextPagePrevious).toStrictEqual(page);
});

afterAll(async () => {
  await container.resolve(MikroORM).close();
});
