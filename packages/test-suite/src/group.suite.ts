import {
  GroupCommand,
  GroupEntity,
  GroupService,
  Order,
  RoleValue,
} from "@white-rabbit/business-logic";
import { container, singleton } from "tsyringe";
import { MikroORM } from "@mikro-orm/core";
import each from "jest-each";
import { Task } from "./task";
import AbstractSuite from "./abstract-suite";

const TASKS: Array<Task<GroupEntity, GroupCommand>> = [
  {
    type: "FindPageTask",
    name: "Find group page",
    input: {
      authUser: { user: { role: RoleValue.OWNER } },
      query: {},
      pagination: { size: 3 },
      sort: [{ field: "name", order: Order.ASC }],
    },
    checker: async ({ item }) => {
      let prevName: string | null = null;
      for (const { data } of item) {
        expect(data.deletedAt).toBeFalsy();
        if (prevName != null) {
          expect(data.name.localeCompare(prevName)).toBeGreaterThan(0);
        }
        prevName = data.name;
      }
    },
    expectNextPage: true,
  },
  {
    type: "FindOneTask",
    name: "Find a group based on an admin",
    input: async (em) => {
      const group = await em.findOneOrFail(
        GroupEntity,
        {},
        { populate: ["admins"] }
      );
      return {
        authUser: { user: { role: RoleValue.OWNER } },
        query: { admins: group.admins.toArray()[0].id },
      };
    },
    checker: async ({ item, input }) => {
      expect(await item?.admins?.loadItems()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: input.query?.admins }),
        ])
      );
    },
  },
];

@singleton()
export default class GroupSuite extends AbstractSuite<
  GroupEntity,
  GroupCommand,
  GroupService
> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(orm: MikroORM, service: GroupService) {
    super(orm, service);
  }

  readonly tasks = TASKS;

  static start(): void {
    describe("GroupSuite should be passed", () => {
      each(TASKS).test("$type: $name", async (task) =>
        container.resolve(GroupSuite).runTask(task)
      );
    });
  }
}
