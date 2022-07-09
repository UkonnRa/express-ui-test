import {
  AccessItemAccessibleTypeValue,
  AccessItemValue,
  JournalEntity,
  JournalService,
  FindInput,
} from "@white-rabbit/business-logic";
import { container, singleton } from "tsyringe";
import { MikroORM } from "@mikro-orm/core";
import each from "jest-each";
import {
  AccessItemTypeValue,
  JournalCommand,
  JournalQuery,
  Order,
  RoleValue,
} from "@white-rabbit/types";
import { Task } from "./task";
import AbstractSuite from "./abstract-suite";
import { Input } from "./task/abstract-task";

const TASKS: Array<Task<JournalEntity, JournalCommand, JournalQuery>> = [
  {
    type: "FindPageTask",
    name: "Find journal page",
    input: {
      authUser: { user: { role: RoleValue.OWNER } },
      query: {},
      pagination: { size: 3 },
      sort: [{ field: "name", order: Order.ASC }],
    },
    checker: async ({ item }) => {
      let prevName: string | null = null;
      for (const { data } of item) {
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
    name: "Find a journal based on an admin",
    input: async (
      em
    ): Promise<Input<FindInput<JournalEntity, JournalQuery>>> => {
      const journal = await em.findOneOrFail(
        JournalEntity,
        {
          archived: false,
          accessItems: {
            type: AccessItemTypeValue.USER,
            accessible: AccessItemAccessibleTypeValue.ADMIN,
          },
        },
        { populate: ["accessItems"] }
      );
      const adminUserId = journal.admins.filter(
        (item) => item.type === AccessItemTypeValue.USER
      )[0].itemId;
      return {
        authUser: { user: { role: RoleValue.OWNER } },
        query: {
          admins: {
            type: AccessItemTypeValue.USER,
            id: adminUserId,
          },
        },
      };
    },
    checker: async ({ item, input }) => {
      const queryAdmin = input.query?.admins;
      expect(await item?.accessItems?.loadItems()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: queryAdmin?.type,
            accessible: AccessItemAccessibleTypeValue.ADMIN,
            user: expect.objectContaining({ id: queryAdmin?.id }),
          }),
        ])
      );
    },
  },

  {
    type: "HandleCommandTask",
    name: "When deleting Journal, all related access items should be deleted",
    input: async (em) => {
      const journal = await em.findOneOrFail(
        JournalEntity,
        {
          archived: false,
        },
        { populate: ["accessItems"] }
      );
      expect(journal.accessItems.length).toBeGreaterThan(0);
      return {
        authUser: { user: { role: RoleValue.ADMIN } },
        command: {
          type: "DeleteJournalCommand",
          targetId: journal.id,
        },
      };
    },
    checker: async ({ input, item }, em) => {
      expect(item).toBeFalsy();

      const accessItems = await em.find(AccessItemValue, {
        journal: input.command.targetId,
      });
      expect(accessItems.length).toBe(0);
    },
  },
];

@singleton()
export default class JournalSuite extends AbstractSuite<
  JournalEntity,
  JournalCommand,
  JournalQuery,
  JournalService
> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(orm: MikroORM, service: JournalService) {
    super(orm, service);
  }

  readonly tasks = TASKS;

  static start(): void {
    describe("JournalSuite should be passed", () => {
      each(TASKS).test("$type: $name", async (task) =>
        container.resolve(JournalSuite).runTask(task)
      );
    });
  }
}
