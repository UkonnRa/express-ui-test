import AbstractSuite from "./abstract-suite";
import {
  CreateUserCommand,
  DeleteUserCommand,
  encodeCursor,
  InvalidCommandError,
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
import { EntityManager, MikroORM } from "@mikro-orm/core";
import {
  FindAllTask,
  HandleCommandsExceptionTask,
  HandleCommandsTask,
  HandleCommandTask,
  Task,
} from "./task";
import each from "jest-each";
import { v4 } from "uuid";
import { faker } from "@faker-js/faker";

const TASKS: Array<Task<UserEntity, UserCommand>> = [
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
    checker: async ({ item }) => {
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
    checker: async ({ item }) => {
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
    checker: async ({ item }) => {
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
    expected: async ({ authUser }): Promise<Partial<NotFoundError>> => ({
      type: "NotFoundError",
      entityType: USER_TYPE,
      id: authUser.user?.id,
    }),
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
    checker: ({ command, item }) => {
      expect(item?.name).toBe(command.name);
      expect(item?.role).toBe(RoleValue.USER);
      expect(item?.authIds?.length).toBe(0);
    },
  } as HandleCommandTask<UserEntity, UserCommand, CreateUserCommand>,
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
    checker: ({ authUser, command, item }) => {
      expect(item?.role).toBe(RoleValue.USER);
      expect(item?.name).toBe(command.name);
      expect(item?.authIds).toEqual([authUser.authId]);
    },
  } as HandleCommandTask<UserEntity, UserCommand, CreateUserCommand>,
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
    } as Partial<InvalidCommandError>,
  },

  {
    type: "HandleCommandTask",
    name: "User[ADMIN] can update any User[USER]",
    setup: async (em) => {
      return em.findOneOrFail(UserEntity, { role: RoleValue.USER });
    },
    input: async (user) => ({
      authUser: { user: { role: RoleValue.ADMIN } },
      command: {
        type: "UpdateUserCommand",
        targetId: user.id,
        name: faker.name.findName(),
      },
    }),
    checker: ({ command, item }) => {
      expect(item?.name).toBe(command.name);
      expect(item?.role).toBe(RoleValue.USER);
    },
  } as HandleCommandTask<
    UserEntity,
    UserCommand,
    UpdateUserCommand,
    UserEntity
  >,
  {
    type: "HandleCommandTask",
    name: "User[ANY] can update self",
    setup: async (em) => {
      return em.findOneOrFail(UserEntity, {});
    },
    input: async (user) => ({
      authUser: { user },
      command: {
        type: "UpdateUserCommand",
        targetId: user.id,
        name: faker.name.findName(),
      },
    }),
    checker: ({ command, item }) => {
      expect(item?.name).toBe(command.name);
    },
  } as HandleCommandTask<
    UserEntity,
    UserCommand,
    UpdateUserCommand,
    UserEntity
  >,
  {
    type: "HandleCommandTask",
    name: "User can update nothing",
    setup: async (em) => {
      return em.findOneOrFail(UserEntity, {});
    },
    input: async (user) => ({
      authUser: { user },
      command: {
        type: "UpdateUserCommand",
        targetId: user.id,
      },
    }),
    checker: ({ command, item }) => {
      expect(item?.id).toBe(command.targetId);
    },
  } as HandleCommandTask<
    UserEntity,
    UserCommand,
    UpdateUserCommand,
    UserEntity
  >,
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
  },
  {
    type: "HandleCommandExceptionTask",
    name: "User[USER] cannot update other Users",
    setup: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.USER,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.USER,
        id: { $ne: authUser.id },
      });
      return [authUser, targetUser];
    },
    input: async ([authUser, targetUser]) => ({
      authUser: { user: authUser },
      command: {
        type: "UpdateUserCommand",
        targetId: targetUser.id,
        name: faker.name.findName(),
      },
    }),
    // eslint-disable-next-line sonarjs/no-identical-functions
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "WRITE",
    } as Partial<NoPermissionError>,
  },
  {
    type: "HandleCommandExceptionTask",
    name: "User[ADMIN] cannot update User[role >= ADMIN]",
    setup: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
        id: { $ne: authUser.id },
      });
      return [authUser, targetUser];
    },
    // eslint-disable-next-line sonarjs/no-identical-functions
    input: async ([authUser, targetUser]) => ({
      authUser: { user: authUser },
      command: {
        type: "UpdateUserCommand",
        targetId: targetUser.id,
        name: faker.name.findName(),
      },
    }),
    // eslint-disable-next-line sonarjs/no-identical-functions
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "WRITE",
    } as Partial<NoPermissionError>,
  },
  {
    type: "HandleCommandExceptionTask",
    name: "User[ADMIN] cannot update others to Role >= ADMIN",
    setup: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.USER,
      });
      return [authUser, targetUser];
    },
    // eslint-disable-next-line sonarjs/no-identical-functions
    input: async ([authUser, targetUser]) => ({
      authUser: { user: authUser },
      command: {
        type: "UpdateUserCommand",
        targetId: targetUser.id,
        role: RoleValue.ADMIN,
      },
    }),
    // eslint-disable-next-line sonarjs/no-identical-functions
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "WRITE",
    } as Partial<NoPermissionError>,
  },
  {
    type: "HandleCommandExceptionTask",
    name: "User[ADMIN] cannot update User[OWNER]",
    setup: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.OWNER,
      });
      return [authUser, targetUser];
    },
    // eslint-disable-next-line sonarjs/no-identical-functions
    input: async ([authUser, targetUser]) => ({
      authUser: { user: authUser },
      command: {
        type: "UpdateUserCommand",
        targetId: targetUser.id,
        name: faker.name.findName(),
      },
    }),
    // eslint-disable-next-line sonarjs/no-identical-functions
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "WRITE",
    } as Partial<NoPermissionError>,
  },

  {
    type: "HandleCommandTask",
    name: "User[ANY] can delete self",
    setup: async (em) => {
      return em.findOneOrFail(UserEntity, {});
    },
    input: async (user) => ({
      authUser: { user },
      command: {
        type: "DeleteUserCommand",
        targetId: user.id,
      },
    }),
    checker: ({ item }) => {
      expect(item).toBeFalsy();
    },
  } as HandleCommandTask<
    UserEntity,
    UserCommand,
    DeleteUserCommand,
    UserEntity
  >,
  {
    type: "HandleCommandTask",
    name: "User[ADMIN] can delete User[USER]",
    // eslint-disable-next-line sonarjs/no-identical-functions
    setup: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.USER,
      });
      return [authUser, targetUser];
    },
    input: async ([authUser, targetUser]) => ({
      authUser: { user: authUser },
      command: {
        type: "DeleteUserCommand",
        targetId: targetUser.id,
      },
    }),
    checker: ({ item }) => {
      expect(item).toBeFalsy();
    },
  },
  {
    type: "HandleCommandExceptionTask",
    name: "User[USER] can delete other users",
    // eslint-disable-next-line sonarjs/no-identical-functions
    setup: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.USER,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.USER,
        id: { $ne: authUser.id },
      });
      return [authUser, targetUser];
    },
    // eslint-disable-next-line sonarjs/no-identical-functions
    input: async ([authUser, targetUser]) => ({
      authUser: { user: authUser },
      command: {
        type: "DeleteUserCommand",
        targetId: targetUser.id,
      },
    }),
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "WRITE",
    },
  },
  {
    type: "HandleCommandExceptionTask",
    name: "User[ADMIN] can delete other User[role >= ADMIN]",
    // eslint-disable-next-line sonarjs/no-identical-functions
    setup: async (em) => {
      const authUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
      });
      const targetUser = await em.findOneOrFail(UserEntity, {
        role: RoleValue.ADMIN,
        id: { $ne: authUser.id },
      });
      return [authUser, targetUser];
    },
    // eslint-disable-next-line sonarjs/no-identical-functions
    input: async ([authUser, targetUser]) => ({
      authUser: { user: authUser },
      command: {
        type: "DeleteUserCommand",
        targetId: targetUser.id,
      },
    }),
    expected: {
      type: "NoPermissionError",
      entityType: USER_TYPE,
      permission: "WRITE",
    },
  },
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
          authIds: [{ provider: faker.company.companyName(), value: v4() }],
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
    checker: ({ commands, items }) => {
      if (items[0] != null && commands[0].type === "CreateUserCommand") {
        expect(items[0].name).toBe(commands[0].name);
        expect(items[0].role).toBe(commands[0].role);
        expect(items[0].authIds).toEqual(commands[0].authIds);
      } else {
        throw new Error(
          "item[0] should not be null, commands[0] should be CreateUserCommand"
        );
      }

      if (items[1] != null && commands[1].type === "UpdateUserCommand") {
        expect(items[1].id).toBe(items[0].id);
        expect(items[1].name).toBe(commands[1].name);
        expect(items[1].role).toBe(commands[0].role);
        expect(items[1].authIds).toEqual(commands[0].authIds);
      } else {
        throw new Error(
          "item[1] should not be null, commands[1] should be UpdateUserCommand"
        );
      }

      if (commands[2].type === "DeleteUserCommand") {
        expect(items[2]).toBeFalsy();
      } else {
        throw new Error("commands[2] should be DeleteUserCommand");
      }
    },
  } as HandleCommandsTask<UserEntity, UserCommand>,
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
          authIds: [{ provider: faker.company.companyName(), value: v4() }],
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
    checker: async ({ commands }, em) => {
      if (commands[0].type === "CreateUserCommand") {
        const result = await em.findOne(UserEntity, {
          name: commands[0].name,
        });
        expect(result).toBeFalsy();
      } else {
        throw new Error("commands[0] should be CreateUserCommand");
      }
    },
  } as HandleCommandsExceptionTask<UserEntity, UserCommand>,
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
