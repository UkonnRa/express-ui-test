import AbstractSuite from "./abstract-suite";
import {
  encodeCursor,
  NoPermissionError,
  Order,
  RoleValue,
  USER_TYPE,
  USER_WRITE_SCOPE,
  UserCommand,
  UserEntity,
  UserService,
} from "@white-rabbit/business-logic";
import { container, singleton } from "tsyringe";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import { FindAllTask, Task } from "./task";
import each from "jest-each";
import { v4 } from "uuid";

const TASKS: Array<Task<UserEntity>> = [
  {
    type: "FindAllTask",
    name: "User[ANY] can find all active users",
    input: {
      authUser: { user: {} },
      query: { role: RoleValue.ADMIN },
      pagination: { size: 3 },
      sort: [{ field: "name", order: Order.ASC }],
    },
    checker: (items) => {
      let prevName: string | null = null;
      for (const { data } of items) {
        expect(data.role).toBe(RoleValue.ADMIN);
        if (prevName != null) {
          expect(data.name.localeCompare(prevName)).toBeGreaterThan(0);
        }
        prevName = data.name;
      }
    },
    expectNextPage: true,
    expectPreviousPage: false,
  },
  {
    type: "FindAllTask",
    name: "User[ANY] can find backward",
    async setup(em: EntityManager) {
      const users = await em.find(
        UserEntity,
        { role: RoleValue.USER },
        { orderBy: { name: Order.DESC }, limit: 5 }
      );
      return users[users.length - 1];
    },
    async input(data) {
      return {
        authUser: { user: {} },
        query: { role: RoleValue.USER },
        pagination: { size: 3, before: encodeCursor({ id: data.id }) },
        sort: [{ field: "name", order: Order.DESC }],
      };
    },
    checker: (items) => {
      let prevName: string | null = null;
      for (const { data } of items) {
        expect(data.role).toBe(RoleValue.USER);
        if (prevName != null) {
          expect(data.name.localeCompare(prevName)).toBeLessThan(0);
        }
        prevName = data.name;
      }
    },
    expectNextPage: true,
    expectPreviousPage: true,
  } as FindAllTask<UserEntity, UserEntity>,
  {
    type: "FindAllTask",
    name: "User[ADMIN] can find deleted users",
    input: {
      authUser: { user: { role: RoleValue.ADMIN } },
      query: {
        deletedAt: { $ne: null },
        $additional: [{ type: "IncludeDeletedQuery" }],
      },
      pagination: { size: 3 },
      sort: [{ field: "name", order: Order.ASC }],
    },
    checker: (items) => {
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(item.data.deletedAt).toBeTruthy();
      }
    },
    expectNextPage: true,
    expectPreviousPage: false,
  },
  {
    type: "FindAllTask",
    name: "User[ANY] starts at the beginning if Cursor[after] and Cursor[before] are not found",
    input: {
      authUser: { user: {} },
      query: {},
      pagination: {
        size: 3,
        before: encodeCursor({ id: v4() }),
        after: encodeCursor({ id: v4() }),
      },
      sort: [{ field: "id", order: Order.DESC }],
    },
    checker: (items) => {
      let prev: string | null = null;
      for (const { data } of items) {
        if (prev != null) {
          expect(data.id.localeCompare(prev)).toBeLessThan(0);
        }
        prev = data.id;
      }
    },
    expectNextPage: true,
    expectPreviousPage: false,
  },
  {
    type: "FindAllExceptionTask",
    name: "User[USER] cannot use Query[IncludeDeletedQuery]",
    input: {
      authUser: { user: { role: RoleValue.USER } },
      query: {
        deletedAt: { $ne: null },
        $additional: [{ type: "IncludeDeletedQuery" }],
      },
      pagination: { size: 3 },
      sort: [{ field: "name", order: Order.ASC }],
    },
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "READ",
    } as Partial<NoPermissionError>,
  },
  {
    type: "FindAllExceptionTask",
    name: "User cannot find anything if no read scope",
    input: {
      authUser: { user: { role: RoleValue.ADMIN }, scopes: [] },
      query: {},
      pagination: { size: 3 },
      sort: [{ field: "name", order: Order.ASC }],
    },
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "READ",
    } as Partial<NoPermissionError>,
  },

  {
    type: "FindOneTask",
    name: "User[ANY] can find any active user",
    input: {
      authUser: { user: {} },
      query: { role: RoleValue.ADMIN },
    },
    checker: (item) => {
      expect(item?.role).toBe(RoleValue.ADMIN);
    },
  },
  {
    type: "FindOneTask",
    name: "User[OWNER] can find an deleted user",
    input: {
      authUser: { user: { role: RoleValue.OWNER } },
      query: {
        deletedAt: { $ne: null },
        $additional: [{ type: "IncludeDeletedQuery" }],
      },
    },
    checker: (item) => {
      expect(item?.deletedAt).toBeTruthy();
    },
  },
  {
    type: "FindOneTask",
    name: "Not found",
    input: {
      authUser: { user: {} },
      query: { id: v4() },
    },
    checker: (item) => {
      expect(item).toBeFalsy();
    },
  },
  {
    type: "FindOneExceptionTask",
    name: "User[USER] cannot use Query[IncludeDeletedQuery]",
    input: {
      authUser: { user: { role: RoleValue.USER } },
      query: {
        deletedAt: { $ne: null },
        $additional: [{ type: "IncludeDeletedQuery" }],
      },
    },
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "READ",
    } as Partial<NoPermissionError>,
  },
  {
    type: "FindOneExceptionTask",
    name: "User cannot find anything if no read scope",
    input: {
      authUser: { user: { role: RoleValue.ADMIN }, scopes: [] },
      query: {},
    },
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "READ",
    } as Partial<NoPermissionError>,
  },
  {
    type: "FindOneExceptionTask",
    name: "User cannot find anything without the related scopes",
    input: {
      authUser: { user: {}, scopes: [USER_WRITE_SCOPE] },
      query: { role: RoleValue.USER },
    },
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "READ",
    } as Partial<NoPermissionError>,
  },
  {
    type: "FindOneExceptionTask",
    name: "User[deleted] cannot do any operation",
    input: {
      authUser: { user: { deletedAt: { $ne: null } } },
      query: { role: RoleValue.USER },
    },
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "READ",
    } as Partial<NoPermissionError>,
  },
];

@singleton()
export default class UserSuite extends AbstractSuite<
  UserEntity,
  UserCommand,
  UserService
> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(orm: MikroORM, service: UserService) {
    super(orm, service);
  }

  readonly tasks = TASKS;

  static start(): void {
    describe("UserSuite should be passed", () => {
      each(TASKS).test("$type: $name", async (task) =>
        container.resolve(UserSuite).runTask(task)
      );
    });
  }
}
