import AbstractSuite from "./abstract-suite";
import {
  NoPermissionError,
  Order,
  RoleValue,
  USER_TYPE,
  UserCommand,
  UserEntity,
  UserService,
} from "@white-rabbit/business-logic";
import { container, singleton } from "tsyringe";
import { MikroORM } from "@mikro-orm/core";
import { Task } from "./task";
import each from "jest-each";

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
