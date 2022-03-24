import {
  Role,
  TYPE_USER,
  User,
  UserCommand,
  UserQuery,
  UserValue,
  UserCommandCreate,
  UserQueryFullText,
  UserCommandUpdate,
  UserCommandRebindAuthProvider,
  UserCommandDelete,
} from "@white-rabbit/business-logic/src/domains/user";
import {
  GroupRepository,
  GroupService,
  UserRepository,
  UserService,
} from "@white-rabbit/business-logic/src/domains";
import { inject, singleton } from "tsyringe";
import {
  NoAuthError,
  NoExpectedScopeError,
  NotFoundError,
} from "@white-rabbit/business-logic/src/shared/errors";
import AuthUser from "@white-rabbit/business-logic/src/shared/auth-user";
import {
  ReadTask,
  ReadTaskPageSuccess,
  ReadTaskSingleSuccess,
  WriteTask,
  WriteTaskFailure,
  WriteTaskSuccess,
} from "../task";
import { AbstractSuite } from "./abstract-suite";

@singleton()
export class UserSuite extends AbstractSuite<
  User,
  UserRepository,
  UserService,
  UserValue,
  UserQuery,
  UserCommand
> {
  constructor(
    @inject("UserRepository") override readonly userRepository: UserRepository,
    override readonly userService: UserService,
    @inject("GroupRepository")
    override readonly groupRepository: GroupRepository,
    override readonly groupService: GroupService
  ) {
    super(TYPE_USER, userRepository, userService);
  }

  override readTasks: Array<ReadTask<User, UserQuery, UserValue>> = [
    new ReadTaskSingleSuccess<UserValue>(
      "find self by ID",
      () => this.getAuthUser(0),
      () => this.users[0].id,
      ({ result }) => expect(result.name).toBe(this.users[0].name)
    ),
    new ReadTaskPageSuccess<User, UserQuery, UserValue, UserQueryFullText>(
      "find all by fullText",
      () => this.getAuthUser(0),
      () => ({
        sort: [{ field: "name", order: "ASC" }],
        pagination: { size: 1, startFrom: "FIRST" },
        query: { type: "UserQueryFullText", keyword: { value: "Owner" } },
      }),
      () => this.users,
      {
        next: [1],
        current: [0],
      }
    ),
    new ReadTaskPageSuccess<User, UserQuery, UserValue, UserQueryFullText>(
      "find all by fullText: numbers",
      () => this.getAuthUser(0),
      () => ({
        sort: [{ field: "name", order: "ASC" }],
        pagination: { size: 2, startFrom: "FIRST" },
        query: { type: "UserQueryFullText", keyword: { value: "2" } },
      }),
      () => this.users,
      {
        next: [3, 5],
        current: [1, 2],
      }
    ),
    new ReadTaskPageSuccess<User, UserQuery, UserValue, UserQueryFullText>(
      "find all from central",
      () => this.getAuthUser(0),
      () => ({
        sort: [{ field: "name", order: "ASC" }],
        pagination: {
          size: 3,
          startFrom: "FIRST",
          after: this.users[1].toCursor(),
        },
      }),
      () => this.users,
      {
        previous: [0, 1],
        current: [2, 3, 4],
        next: [5],
      }
    ),
    new ReadTaskPageSuccess<User, UserQuery, UserValue, UserQueryFullText>(
      "find all from last",
      () => this.getAuthUser(0),
      () => ({
        sort: [{ field: "name", order: "ASC" }],
        pagination: {
          size: 3,
          startFrom: "LAST",
          before: this.users[5].toCursor(),
        },
      }),
      () => this.users,
      {
        previous: [0, 1],
        current: [2, 3, 4],
        next: [5],
      }
    ),
    new ReadTaskPageSuccess<User, UserQuery, UserValue, UserQueryFullText>(
      "find all sorting role",
      () => this.getAuthUser(0),
      () => ({
        sort: [{ field: "role", order: "ASC" }],
        pagination: {
          size: 3,
          startFrom: "FIRST",
          before: this.users[2].toCursor(),
        },
      }),
      () => this.users,
      {
        current: [4, 5],
        next: [2, 3, 0],
      }
    ),
    new ReadTaskPageSuccess<User, UserQuery, UserValue, UserQueryFullText>(
      "find all sorting role: reverse",
      () => this.getAuthUser(0),
      () => ({
        sort: [{ field: "role", order: "ASC" }],
        pagination: {
          size: 3,
          startFrom: "LAST",
          after: this.users[0].toCursor(),
        },
      }),
      () => this.users,
      {
        current: [1],
        previous: [2, 3, 0],
      }
    ),
  ];

  override writeTasks: Array<WriteTask<UserCommand, User>> = [
    new WriteTaskSuccess<UserCommand, User, UserCommandCreate>(
      "create when login",
      () =>
        this.getAuthUser({
          provider: "New Provider",
          id: "Provider ID",
        }),
      () => ({ type: "UserCommandCreate", name: "New Name", role: Role.USER }),
      ({ command, result }) =>
        check(command, result, {
          authIds: new Map([["New Provider", "Provider ID"]]),
        })
    ),
    new WriteTaskSuccess<UserCommand, User, UserCommandCreate>(
      "create by owners",
      () => this.getAuthUser(0),
      () => ({
        type: "UserCommandCreate",
        name: "New Name",
        role: Role.ADMIN,
        authIds: new Map([["New Provider", "Provider ID"]]),
      }),
      ({ command, result }) => check(command, result)
    ),
    new WriteTaskSuccess<UserCommand, User, UserCommandCreate>(
      "create by admins",
      () => this.getAuthUser(2),
      () => ({
        type: "UserCommandCreate",
        name: "New Name",
        role: Role.USER,
        authIds: new Map([["New Provider", "Provider ID"]]),
      }),
      ({ command, result }) => check(command, result)
    ),
    new WriteTaskFailure<UserCommand, NoExpectedScopeError>(
      "create by owner without scope",
      () => this.getAuthUser(0, []),
      () => ({
        type: "UserCommandCreate",
        name: "New Name 1",
        role: Role.USER,
        authIds: new Map([["New Provider", "Provider ID"]]),
      }),
      () => ({
        scope: this.service.writeScope,
      })
    ),
    new WriteTaskFailure<UserCommand, NoAuthError>(
      "create by login: role not USER",
      () =>
        this.getAuthUser({
          provider: "New Provider 1",
          id: "Provider ID",
        }),
      () => ({
        type: "UserCommandCreate",
        name: "New Name 1",
        role: Role.ADMIN,
      }),
      () => ({
        type: TYPE_USER,
        field: "role",
      })
    ),
    new WriteTaskFailure<UserCommand, NoAuthError>(
      "create by login: auth existing",
      () =>
        this.getAuthUser({
          provider: "New Provider 2",
          id: "Provider ID",
        }),
      () => ({
        type: "UserCommandCreate",
        name: "New Name 2",
        role: Role.USER,
        authIds: new Map([["New Provider", "Provider ID"]]),
      }),
      () => ({
        type: TYPE_USER,
        field: "authIds",
      })
    ),
    new WriteTaskFailure<UserCommand, NoAuthError>(
      "create by user: command role greater than user role",
      () => this.getAuthUser(2),
      () => ({
        type: "UserCommandCreate",
        name: "New Name 2",
        role: Role.OWNER,
        authIds: new Map([["New Provider", "Provider ID"]]),
      }),
      ({ authUser }) => ({
        type: TYPE_USER,
        operatorId: authUser.user?.id,
      })
    ),
    new WriteTaskFailure<UserCommand, NoAuthError>(
      "create by user: command role equals to user role",
      () => this.getAuthUser(2),
      () => ({
        type: "UserCommandCreate",
        name: "New Name Admin",
        role: Role.ADMIN,
        authIds: new Map([["New Provider", "Provider ID"]]),
      }),
      ({ authUser }) => ({
        type: TYPE_USER,
        operatorId: authUser.user?.id,
      })
    ),
    new WriteTaskSuccess<UserCommand, User, UserCommandUpdate>(
      "update self",
      () => this.getAuthUser(4),
      () => ({
        type: "UserCommandUpdate",
        id: this.users[4].id,
        name: "New Name",
      }),
      ({ command, result }) =>
        check(command, result, {
          role: this.users[4].role,
          authIds: this.users[4].authIds,
        })
    ),
    new WriteTaskSuccess<UserCommand, User, UserCommandUpdate>(
      "update by admins",
      () => this.getAuthUser(2),
      () => ({
        type: "UserCommandUpdate",
        id: this.users[4].id,
        authIds: new Map([["New Provider", "New Value"]]),
      }),
      ({ command, result }) =>
        check(command, result, {
          id: this.users[4].id,
          role: this.users[4].role,
          name: this.users[4].name,
        })
    ),
    new WriteTaskSuccess<UserCommand, User, UserCommandUpdate>(
      "update by owners",
      () => this.getAuthUser(0),
      () => ({
        type: "UserCommandUpdate",
        id: this.users[4].id,
        role: Role.ADMIN,
      }),
      ({ command, result }) =>
        check(command, result, {
          id: this.users[4].id,
          name: this.users[4].name,
          authIds: this.users[4].authIds,
        })
    ),
    new WriteTaskSuccess<UserCommand, User, UserCommandUpdate>(
      "update nothing",
      () => this.getAuthUser(2),
      () => ({
        type: "UserCommandUpdate",
        id: this.users[4].id,
      }),
      ({ command, result }) =>
        check(command, result, {
          id: this.users[4].id,
          role: this.users[4].role,
          name: this.users[4].name,
          authIds: this.users[4].authIds,
        })
    ),
    new WriteTaskFailure<UserCommand, NotFoundError>(
      "update by User: no authUser",
      () =>
        this.getAuthUser({
          provider: "New Provider",
          id: "Provider ID 1",
        }),
      () => ({
        type: "UserCommandUpdate",
        id: this.users[5].id,
        name: "New Name",
      }),
      ({ authUser }) => ({
        type: TYPE_USER,
        id: authUser.authIdValue,
      })
    ),
    new WriteTaskFailure<UserCommand, NoAuthError>(
      "update by User: update others",
      () => this.getAuthUser(4),
      () => ({
        type: "UserCommandUpdate",
        id: this.users[5].id,
        name: "New Name 1",
      }),
      ({ authUser, command }) => ({
        type: TYPE_USER,
        operatorId: authUser.user?.id,
        id: command.id,
      })
    ),
    new WriteTaskFailure<UserCommand, NoAuthError>(
      "update by Admin: update Owner",
      () => this.getAuthUser(3),
      () => ({
        type: "UserCommandUpdate",
        id: this.users[0].id,
        name: "New Name",
      }),
      ({ authUser }) => ({
        type: TYPE_USER,
        operatorId: authUser.user?.id,
        id: this.users[0].id,
      })
    ),
    new WriteTaskFailure<UserCommand, NoAuthError>(
      "update role: command role greater than self role",
      () => this.getAuthUser(2),
      () => ({
        type: "UserCommandUpdate",
        id: this.users[4].id,
        role: Role.OWNER,
      }),
      ({ authUser, command }) => ({
        type: TYPE_USER,
        operatorId: authUser.user?.id,
        id: command.id,
        field: "role",
      })
    ),
    new WriteTaskFailure<UserCommand, NoAuthError>(
      "update authIds: User update authIds directly",
      () => this.getAuthUser(5),
      () => ({
        type: "UserCommandUpdate",
        id: this.users[5].id,
        authIds: new Map([["New Provider", "New Value"]]),
      }),
      ({ authUser, command }) => ({
        type: TYPE_USER,
        operatorId: authUser.user?.id,
        id: command.id,
        field: "authIds",
      })
    ),
    new WriteTaskSuccess<UserCommand, User, UserCommandRebindAuthProvider>(
      "rebind auth token",
      () => {
        const authUser = this.getAuthUser(4);
        return new AuthUser(
          {
            provider: "Provider 3",
            id: "New Id",
          },
          authUser.scopes,
          authUser.user
        );
      },
      () => ({
        type: "UserCommandRebindAuthProvider",
        id: this.users[4].id,
      }),
      ({ authUser, result }) => {
        expect(result?.authIds.get(authUser.authId.provider)).toBe(
          authUser.authId.id
        );
      }
    ),
    new WriteTaskSuccess<UserCommand, User, UserCommandDelete>(
      "delete user",
      () => this.getAuthUser(4),
      () => ({
        type: "UserCommandDelete",
        id: this.users[4].id,
      }),
      ({ result }) => {
        expect(result).toBeFalsy();
      }
    ),
    new WriteTaskSuccess<UserCommand, User, UserCommandDelete>(
      "delete user by admin",
      () => this.getAuthUser(2),
      () => ({
        type: "UserCommandDelete",
        id: this.users[4].id,
      }),
      ({ result }) => {
        expect(result).toBeFalsy();
      }
    ),
    new WriteTaskSuccess<UserCommand, User, UserCommandDelete>(
      "delete user by owner",
      () => this.getAuthUser(0),
      () => ({
        type: "UserCommandDelete",
        id: this.users[2].id,
      }),
      ({ result }) => {
        expect(result).toBeFalsy();
      }
    ),
    new WriteTaskFailure<UserCommand, NotFoundError>(
      "delete user: already deleted",
      () => this.getAuthUser(0),
      () => ({
        type: "UserCommandDelete",
        id: this.users[6].id,
      }),
      ({ command }) => ({
        type: TYPE_USER,
        id: command.id,
      })
    ),
  ];
}

function check<CC extends UserCommand>(
  command: CC,
  result?: User,
  options?: Partial<CC>
): void {
  if (command.type === "UserCommandCreate") {
    if (result != null) {
      expect({
        name: result.name,
        role: result.role,
        authIds: result.authIds,
      }).toStrictEqual({
        name: command.name,
        role: command.role,
        authIds: command.authIds,
        ...options,
      });
    } else {
      fail("No user created");
    }
  } else if (command.type === "UserCommandUpdate") {
    if (result != null) {
      expect({
        id: result.id,
        name: result.name,
        role: result.role,
        authIds: result.authIds,
      }).toStrictEqual({
        id: command.id,
        name: command.name ?? result.name,
        role: command.role ?? result.role,
        authIds: command.authIds ?? result.authIds,
        ...options,
      });
    } else {
      fail(`User[${command.id}] failed to update`);
    }
  }
}
