import {
  AccessItemTypeValue,
  AccessItemUserValue,
  DeleteUserCommand,
  encodeCursor,
  NoPermissionError,
  NotFoundError,
  Order,
  RoleValue,
  UpdateUserCommand,
  USER_TYPE,
  USER_WRITE_SCOPE,
  UserCommand,
  UserEntity,
  UserService,
} from "@white-rabbit/business-logic";
import { container, singleton } from "tsyringe";
import { MikroORM } from "@mikro-orm/core";
import each from "jest-each";
import { v4 } from "uuid";
import { faker } from "@faker-js/faker";
import { HandleCommandExceptionTask, HandleCommandTask, Task } from "./task";
import AbstractSuite from "./abstract-suite";

const TASKS: Array<Task<UserEntity, UserCommand>> = [
  {
    type: "FindPageTask",
    name: "User[ANY] can find all active users",
    input: {
      authUser: { user: { role: { $ne: null } } },
      query: { role: RoleValue.ADMIN },
      pagination: { size: 3 },
      sort: [{ field: "name", order: Order.ASC }],
    },
    checker: async ({ item }) => {
      let prevName: string | null = null;
      for (const { data } of item) {
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
    type: "FindPageTask",
    name: "User[ANY] can find backward",

    async input(em) {
      const users = await em.find(
        UserEntity,
        { role: RoleValue.USER },
        { orderBy: { name: Order.DESC }, limit: 5 }
      );
      const data = users[users.length - 1];

      return {
        authUser: { user: { role: { $ne: null } } },
        query: { role: RoleValue.USER },
        pagination: { size: 3, before: encodeCursor({ id: data.id }) },
        sort: [{ field: "name", order: Order.DESC }],
      };
    },
    checker: async ({ item }) => {
      let prevName: string | null = null;
      for (const { data } of item) {
        expect(data.role).toBe(RoleValue.USER);
        if (prevName != null) {
          expect(data.name.localeCompare(prevName)).toBeLessThan(0);
        }
        prevName = data.name;
      }
    },
    expectNextPage: true,
    expectPreviousPage: true,
  },
  {
    type: "FindPageTask",
    name: "User[ANY] starts at the beginning if Cursor[after] and Cursor[before] are not found",
    input: {
      authUser: { user: { role: { $ne: null } } },
      query: { role: RoleValue.USER },
      pagination: {
        size: 3,
        before: encodeCursor({ id: v4() }),
        after: encodeCursor({ id: v4() }),
      },
      sort: [{ field: "id", order: Order.DESC }],
    },
    checker: async ({ item }) => {
      let prev: string | null = null;
      for (const { data } of item) {
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
    type: "FindPageExceptionTask",
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
      authUser: { user: { role: { $ne: null } } },
      query: { role: RoleValue.ADMIN },
    },
    checker: async ({ item }) => {
      expect(item?.role).toBe(RoleValue.ADMIN);
    },
  },
  {
    type: "FindOneTask",
    name: "Not found",
    input: {
      authUser: { user: { role: RoleValue.OWNER } },
      query: { id: v4() },
    },
    checker: async ({ item }) => {
      expect(item).toBeFalsy();
    },
  },
  {
    type: "FindOneExceptionTask",
    name: "User cannot find anything if no read scope",
    input: {
      authUser: { user: { role: RoleValue.ADMIN }, scopes: [] },
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
    name: "User cannot find anything without the related scopes",
    input: {
      authUser: { user: { role: { $ne: null } }, scopes: [USER_WRITE_SCOPE] },
      query: { role: RoleValue.USER },
    },
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "READ",
    } as Partial<NoPermissionError>,
  },

  {
    type: "HandleCommandTask",
    name: "User[ADMIN] can add an user",
    input: {
      authUser: { user: { role: RoleValue.ADMIN } },
      command: {
        type: "CreateUserCommand",
        name: faker.name.findName(),
        role: RoleValue.USER,
      },
    },
    checker: async ({ input, item }) => {
      expect(item?.name).toBe(input.command.name);
      expect(item?.role).toBe(RoleValue.USER);
      expect(Object.keys(item?.authIds ?? {}).length).toBe(0);
    },
  },
  {
    type: "HandleCommandTask",
    name: "User can add self if not in system yet",
    input: {
      authUser: {
        authId: { provider: faker.company.companyName(), value: v4() },
      },
      command: {
        type: "CreateUserCommand",
        name: faker.name.findName(),
      },
    },
    checker: async ({ input, item }) => {
      expect(item?.role).toBe(RoleValue.USER);
      expect(item?.name).toBe(input.command.name);
      expect(item?.authIds).toEqual({
        [input.authUser.authId.provider]: input.authUser.authId.value,
      });
    },
  },
  {
    type: "HandleCommandExceptionTask",
    name: "User cannot create self other than User[USER]",
    input: {
      authUser: {
        authId: { provider: faker.company.companyName(), value: v4() },
      },
      command: {
        type: "CreateUserCommand",
        name: faker.name.findName(),
        role: RoleValue.ADMIN,
      },
    },
    expected: {
      type: "InvalidCommandError",
    },
  },

  {
    type: "HandleCommandTask",
    name: "User[ADMIN] can update any User[USER]",
    input: async (em) => {
      const user = await em.findOneOrFail(UserEntity, { role: RoleValue.USER });
      return {
        authUser: { user: { role: RoleValue.ADMIN } },
        command: {
          type: "UpdateUserCommand",
          targetId: user.id,
          name: faker.name.findName(),
        },
      };
    },
    checker: async ({ input, item }) => {
      expect(item?.name).toBe(input.command.name);
      expect(item?.role).toBe(RoleValue.USER);
    },
  } as HandleCommandTask<UserEntity, UserCommand, UpdateUserCommand>,
  {
    type: "HandleCommandTask",
    name: "User[ANY] can update self",
    input: async (em) => {
      const user = await em.findOneOrFail(UserEntity, { role: { $ne: null } });
      return {
        authUser: { user: { id: user.id } },
        command: {
          type: "UpdateUserCommand",
          targetId: user.id,
          name: faker.name.findName(),
        },
      };
    },
    checker: async ({ input, item }) => {
      expect(item?.name).toBe(input.command.name);
    },
  } as HandleCommandTask<UserEntity, UserCommand, UpdateUserCommand>,
  {
    type: "HandleCommandTask",
    name: "User can update nothing",
    input: async (em) => {
      const user = await em.findOneOrFail(UserEntity, { role: { $ne: null } });
      return {
        authUser: { user },
        command: {
          type: "UpdateUserCommand",
          targetId: user.id,
        },
      };
    },
    checker: async ({ input, item }) => {
      expect(item?.id).toBe(input.command.targetId);
    },
  } as HandleCommandTask<UserEntity, UserCommand, UpdateUserCommand>,
  {
    type: "HandleCommandExceptionTask",
    name: "User cannot update non-existing User",
    input: {
      authUser: { user: { role: RoleValue.ADMIN } },
      command: {
        type: "UpdateUserCommand",
        targetId: v4(),
        name: faker.name.findName(),
        role: RoleValue.USER,
      },
    },
    expected: async ({ command }): Promise<Partial<NotFoundError>> => ({
      type: "NotFoundError",
      entityType: USER_TYPE,
      id: command.targetId,
    }),
  } as HandleCommandExceptionTask<UserEntity, UserCommand, UpdateUserCommand>,
  {
    type: "HandleCommandExceptionTask",
    name: "User[USER] cannot update other Users",

    input: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.USER,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.USER,
        id: { $ne: authUser.id },
      });
      return {
        authUser: {
          user: authUser,
        },
        command: {
          type: "UpdateUserCommand",
          targetId: targetUser.id,
          name: faker.name.findName(),
        },
      };
    },
    // eslint-disable-next-line sonarjs/no-identical-functions
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "WRITE",
    } as Partial<NoPermissionError>,
  } as HandleCommandExceptionTask<UserEntity, UserCommand, UpdateUserCommand>,
  {
    type: "HandleCommandExceptionTask",
    name: "User[ADMIN] cannot update User[role >= ADMIN]",
    // eslint-disable-next-line sonarjs/no-identical-functions
    input: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
        id: { $ne: authUser.id },
      });
      return {
        authUser: { user: authUser },
        command: {
          type: "UpdateUserCommand",
          targetId: targetUser.id,
          name: faker.name.findName(),
        },
      };
    },
    // eslint-disable-next-line sonarjs/no-identical-functions
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "WRITE",
    } as Partial<NoPermissionError>,
  } as HandleCommandExceptionTask<UserEntity, UserCommand, UpdateUserCommand>,
  {
    type: "HandleCommandExceptionTask",
    name: "User[ADMIN] cannot update others to Role >= ADMIN",

    // eslint-disable-next-line sonarjs/no-identical-functions
    input: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.USER,
      });
      return {
        authUser: { user: authUser },
        command: {
          type: "UpdateUserCommand",
          targetId: targetUser.id,
          role: RoleValue.ADMIN,
        },
      };
    },
    // eslint-disable-next-line sonarjs/no-identical-functions
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "WRITE",
    } as Partial<NoPermissionError>,
  } as HandleCommandExceptionTask<UserEntity, UserCommand, UpdateUserCommand>,
  {
    type: "HandleCommandExceptionTask",
    name: "User[ADMIN] cannot update User[OWNER]",
    // eslint-disable-next-line sonarjs/no-identical-functions
    input: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.OWNER,
      });
      return {
        authUser: { user: authUser },
        command: {
          type: "UpdateUserCommand",
          targetId: targetUser.id,
          name: faker.name.findName(),
        },
      };
    },
    // eslint-disable-next-line sonarjs/no-identical-functions
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "WRITE",
    } as Partial<NoPermissionError>,
  } as HandleCommandExceptionTask<UserEntity, UserCommand, UpdateUserCommand>,

  {
    type: "HandleCommandTask",
    name: "User[ANY] can delete self",
    input: async (em) => {
      const user = await em.findOneOrFail(UserEntity, { role: RoleValue.USER });
      return {
        authUser: { user },
        command: {
          type: "DeleteUserCommand",
          targetId: user.id,
        },
      };
    },
    checker: async ({ item, input }, em) => {
      expect(item).toBeFalsy();

      const accessItems = await em.find(AccessItemUserValue, {
        type: AccessItemTypeValue.USER,
        user: input.command.targetId,
      });
      expect(accessItems.length).toBeFalsy();
    },
  } as HandleCommandTask<UserEntity, UserCommand, DeleteUserCommand>,
  {
    type: "HandleCommandTask",
    name: "User[ADMIN] can delete User[USER]",
    // eslint-disable-next-line sonarjs/no-identical-functions
    input: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.USER,
      });
      return {
        authUser: { user: authUser },
        command: {
          type: "DeleteUserCommand",
          targetId: targetUser.id,
        },
      };
    },
    checker: async ({ item }) => {
      expect(item).toBeFalsy();
    },
  } as HandleCommandTask<UserEntity, UserCommand, DeleteUserCommand>,
  {
    type: "HandleCommandExceptionTask",
    name: "User[USER] can delete other users",
    // eslint-disable-next-line sonarjs/no-identical-functions
    input: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.USER,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.USER,
        id: { $ne: authUser.id },
      });

      return {
        authUser: { user: authUser },
        command: {
          type: "DeleteUserCommand",
          targetId: targetUser.id,
        },
      };
    },
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "WRITE",
    },
  } as HandleCommandExceptionTask<UserEntity, UserCommand, DeleteUserCommand>,
  {
    type: "HandleCommandExceptionTask",
    name: "User[ADMIN] can delete other User[role >= ADMIN]",
    // eslint-disable-next-line sonarjs/no-identical-functions
    input: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
        id: { $ne: authUser.id },
      });
      return {
        authUser: { user: authUser },
        command: {
          type: "DeleteUserCommand",
          targetId: targetUser.id,
        },
      };
    },
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "WRITE",
    },
  } as HandleCommandExceptionTask<UserEntity, UserCommand, DeleteUserCommand>,
  {
    type: "HandleCommandExceptionTask",
    name: "User cannot delete non-existing users",
    input: {
      authUser: { user: { role: RoleValue.ADMIN } },
      command: {
        type: "DeleteUserCommand",
        targetId: v4(),
      },
    },
    // eslint-disable-next-line sonarjs/no-identical-functions
    expected: async ({ command }): Promise<Partial<NotFoundError>> => ({
      type: "NotFoundError",
      entityType: USER_TYPE,
      id: command.targetId,
    }),
  },
  {
    type: "HandleCommandsTask",
    name: "User[ADMIN] can create, update, delete a user in a batch",
    input: {
      authUser: { user: { role: RoleValue.ADMIN } },
      commands: [
        {
          type: "CreateUserCommand",
          targetId: "lid-1",
          name: faker.name.findName(),
          role: RoleValue.USER,
          authIds: { [faker.company.companyName()]: v4() },
        },
        {
          type: "UpdateUserCommand",
          targetId: "lid-1",
          name: faker.name.findName(),
        },
        {
          type: "DeleteUserCommand",
          targetId: "lid-1",
        },
      ],
    },
    checker: async ({ input, item }) => {
      const { commands } = input;
      if (item[0] != null && commands[0].type === "CreateUserCommand") {
        expect(item[0].name).toBe(commands[0].name);
        expect(item[0].role).toBe(commands[0].role);
        expect(item[0].authIds).toEqual(commands[0].authIds);
      } else {
        throw new Error(
          "item[0] should not be null, commands[0] should be CreateUserCommand"
        );
      }

      if (item[1] != null && commands[1].type === "UpdateUserCommand") {
        expect(item[1].id).toBe(item[0].id);
        expect(item[1].name).toBe(commands[1].name);
        expect(item[1].role).toBe(commands[0].role);
        expect(item[1].authIds).toEqual(commands[0].authIds);
      } else {
        throw new Error(
          "item[1] should not be null, commands[1] should be UpdateUserCommand"
        );
      }

      if (commands[2].type === "DeleteUserCommand") {
        expect(item[2]).toBeFalsy();
      } else {
        throw new Error("commands[2] should be DeleteUserCommand");
      }
    },
  },
  {
    type: "HandleCommandsExceptionTask",
    name: "If meet any error, the batch should be reverted",
    input: {
      authUser: { user: { role: RoleValue.ADMIN } },
      commands: [
        {
          type: "CreateUserCommand",
          name: faker.name.findName(),
          role: RoleValue.USER,
          authIds: { [faker.company.companyName()]: v4() },
        },
        {
          type: "UpdateUserCommand",
          targetId: v4(),
          name: faker.name.findName(),
        },
      ],
    },
    expected: async ({ commands }): Promise<Partial<NotFoundError>> => ({
      type: "NotFoundError",
      entityType: USER_TYPE,
      id: commands[1].targetId,
    }),
    checker: async ({ input }, em) => {
      const { commands } = input;
      if (commands[0].type === "CreateUserCommand") {
        const result = await em.findOne(UserEntity, {
          name: commands[0].name,
        });
        expect(result).toBeFalsy();
      } else {
        throw new Error("commands[0] should be CreateUserCommand");
      }
    },
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
