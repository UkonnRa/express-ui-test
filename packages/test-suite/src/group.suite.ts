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
import { Task } from "./task";
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
