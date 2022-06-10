import AbstractSuite from "./abstract-suite";
import {
  GroupCommand,
  GroupEntity,
  GroupService,
  Order,
  RoleValue,
} from "@white-rabbit/business-logic";
import { container, singleton } from "tsyringe";
import { MikroORM } from "@mikro-orm/core";
import { FindOneTask, Task } from "./task";
import each from "jest-each";

const TASKS: Array<Task<GroupEntity, GroupCommand>> = [
  {
    type: "FindAllTask",
    name: "Find all groups",
    input: {
      authUser: { user: { role: RoleValue.OWNER } },
      query: {},
      pagination: { size: 3 },
      sort: [{ field: "name", order: Order.ASC }],
    },
    checker: (items) => {
      let prevName: string | null = null;
      for (const { data } of items) {
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
    setup: async (em) => {
      return em.findOneOrFail(GroupEntity, {}, { populate: ["admins"] });
    },
    input: async (group) => ({
      authUser: { user: { role: RoleValue.OWNER } },
      query: { admins: group.admins.toArray()[0].id },
    }),
    checker: async ({ item, input }) => {
      expect(await item?.admins?.loadItems()).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: input?.admins })])
      );
    },
  } as FindOneTask<GroupEntity, GroupEntity>,
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
