import { inject, singleton } from "tsyringe";
import {
  GroupRepository,
  GroupService,
  JournalRepository,
  UserRepository,
  TYPE_GROUP,
  Group,
  GroupValue,
  GroupQuery,
  GroupCommand,
  GroupCommandCreate,
  GroupCommandUpdate,
  GroupCommandDelete,
  GroupQueryFullText,
  GroupQueryByUser,
  FieldValidationLengthError,
  NoExpectedScopeError,
  NotFoundError,
  NoAuthError,
  TYPE_USER,
} from "@white-rabbit/business-logic";
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
export class GroupSuite extends AbstractSuite<
  Group,
  GroupRepository,
  GroupService,
  GroupValue,
  GroupQuery,
  GroupCommand
> {
  constructor(
    @inject("UserRepository") override readonly userRepository: UserRepository,
    @inject("GroupRepository")
    override readonly groupRepository: GroupRepository,
    @inject("JournalRepository")
    override readonly journalRepository: JournalRepository,
    groupService: GroupService
  ) {
    super(TYPE_GROUP, groupRepository, groupService);
  }

  override readTasks: Array<ReadTask<Group, GroupQuery, GroupValue>> = [
    new ReadTaskSingleSuccess<GroupValue>(
      "find by ID",
      () => this.getAuthUser(4),
      () => this.groups[1].id,
      ({ result }) => expect(result.name).toBe(this.groups[1].name)
    ),
    new ReadTaskPageSuccess<Group, GroupQuery, GroupValue, GroupQueryFullText>(
      "find all by full text by user",
      () => this.getAuthUser(5),
      () => ({
        sort: [{ field: "name", order: "ASC" }],
        pagination: { size: 2, startFrom: "FIRST" },
        query: { type: "GroupQueryFullText", keyword: { value: "Group" } },
      }),
      () => this.groups,
      {
        next: [3],
        current: [1, 2],
      }
    ),
    new ReadTaskPageSuccess<Group, GroupQuery, GroupValue, GroupQueryFullText>(
      "find all by full text by admin",
      () => this.getAuthUser(0),
      () => ({
        sort: [{ field: "name", order: "ASC" }],
        pagination: { size: 2, startFrom: "FIRST" },
        query: {
          type: "GroupQueryFullText",
          keyword: { fields: ["description"], value: "bar" },
        },
      }),
      () => this.groups,
      {
        next: [3],
        current: [0, 1],
      }
    ),
    new ReadTaskPageSuccess<Group, GroupQuery, GroupValue, GroupQueryByUser>(
      "find all by user contains",
      () => this.getAuthUser(0),
      () => ({
        sort: [{ field: "name", order: "ASC" }],
        pagination: { size: 2, startFrom: "FIRST" },
        query: {
          type: "GroupQueryByUser",
          user: this.users[0].id,
        },
      }),
      () => this.groups,
      {
        current: [0, 2],
      }
    ),
    new ReadTaskPageSuccess<Group, GroupQuery, GroupValue, GroupQueryByUser>(
      "find all by admin contains",
      () => this.getAuthUser(0),
      () => ({
        sort: [{ field: "name", order: "ASC" }],
        pagination: { size: 2, startFrom: "FIRST" },
        query: {
          type: "GroupQueryByUser",
          user: this.users[4].id,
          field: "admins",
        },
      }),
      () => this.groups,
      {
        current: [0, 1],
      }
    ),
    new ReadTaskPageSuccess<Group, GroupQuery, GroupValue, GroupQueryByUser>(
      "find all by members contains",
      () => this.getAuthUser(0),
      () => ({
        sort: [{ field: "name", order: "ASC" }],
        pagination: { size: 2, startFrom: "FIRST" },
        query: {
          type: "GroupQueryByUser",
          user: this.users[3].id,
          field: "members",
        },
      }),
      () => this.groups,
      {
        current: [1, 3],
      }
    ),
  ];

  override writeTasks: Array<WriteTask<GroupCommand, Group>> = [
    new WriteTaskSuccess<GroupCommand, Group, GroupCommandCreate>(
      "create",
      () => this.getAuthUser(4),
      () => ({
        type: "GroupCommandCreate",
        name: "New Name",
        description: "New Desc",
        admins: [this.users[4].id],
        members: [this.users[5].id],
      }),
      ({ command, result }) => check(command, result)
    ),
    new WriteTaskSuccess<GroupCommand, Group, GroupCommandCreate>(
      "create with long duplicate admins",
      () => this.getAuthUser(4),
      () => ({
        type: "GroupCommandCreate",
        name: "New Name",
        description: "New Desc",
        admins: Array(1024).fill(this.users[4].id),
        members: [this.users[5].id],
      }),
      ({ command, result }) =>
        check(command, result, {
          admins: [this.users[4].id],
        })
    ),
    new WriteTaskFailure<GroupCommand, NotFoundError, GroupCommandCreate>(
      "create: without valid auth user instance",
      () =>
        this.getAuthUser({
          provider: "New Provider 1",
          id: "Provider ID",
        }),
      () => ({
        type: "GroupCommandCreate",
        name: "New Name 1",
        description: "New Desc",
        admins: [this.users[4].id],
        members: [this.users[5].id],
      }),
      ({ authUser }) => ({ type: TYPE_USER, id: authUser.authIdValue })
    ),
    new WriteTaskFailure<
      GroupCommand,
      NoExpectedScopeError,
      GroupCommandCreate
    >(
      "create: without valid auth user instance",
      () => this.getAuthUser(0, []),
      () => ({
        type: "GroupCommandCreate",
        name: "New Name 2",
        description: "New Desc",
        admins: [this.users[4].id],
        members: [this.users[5].id],
      }),
      ({ authUser }) => ({
        operatorId: authUser.user?.id,
        scope: this.service.writeScope,
      })
    ),
    new WriteTaskFailure<
      GroupCommand,
      FieldValidationLengthError,
      GroupCommandCreate
    >(
      "create: overflow name length",
      () => this.getAuthUser(0),
      () => ({
        type: "GroupCommandCreate",
        name: Array(60).fill("a").join(""),
        description: "New Desc",
        admins: [this.users[4].id],
        members: [this.users[5].id],
      }),
      () => ({ type: TYPE_GROUP, field: "name" })
    ),
    new WriteTaskFailure<
      GroupCommand,
      FieldValidationLengthError,
      GroupCommandCreate
    >(
      "create: underflow name length",
      () => this.getAuthUser(0),
      () => ({
        type: "GroupCommandCreate",
        name: "a",
        description: "New Desc",
        admins: [this.users[4].id],
        members: [this.users[5].id],
      }),
      () => ({ type: TYPE_GROUP, field: "name" })
    ),
    new WriteTaskFailure<
      GroupCommand,
      FieldValidationLengthError,
      GroupCommandCreate
    >(
      "create: overflow description length",
      () => this.getAuthUser(0),
      () => ({
        type: "GroupCommandCreate",
        name: "New Name",
        description: Array(500).fill("a").join(""),
        admins: [this.users[4].id],
        members: [this.users[5].id],
      }),
      () => ({ type: TYPE_GROUP, field: "description" })
    ),
    new WriteTaskSuccess<GroupCommand, Group, GroupCommandUpdate>(
      "update",
      () => this.getAuthUser(4),
      () => ({
        type: "GroupCommandUpdate",
        id: this.groups[0].id,
        name: "New Name",
        description: "New Desc",
        admins: [this.users[0].id, this.users[4].id],
      }),
      ({ command, result }) =>
        check(command, result, {
          admins: [this.users[0].id, this.users[4].id],
          members: [this.users[1].id],
        })
    ),
    new WriteTaskSuccess<GroupCommand, Group, GroupCommandUpdate>(
      "update: nothing",
      () => this.getAuthUser(4),
      () => ({
        type: "GroupCommandUpdate",
        id: this.groups[0].id,
      }),
      ({ command, result }) => check(command, result)
    ),
    new WriteTaskSuccess<GroupCommand, Group, GroupCommandUpdate>(
      "update: admin update all",
      () => this.getAuthUser(2),
      () => ({
        type: "GroupCommandUpdate",
        id: this.groups[0].id,
        members: [this.users[4].id],
      }),
      ({ command, result }) =>
        check(command, result, {
          members: [],
        })
    ),
    new WriteTaskFailure<GroupCommand, NoAuthError, GroupCommandUpdate>(
      "update: user not admins",
      () => this.getAuthUser(5),
      () => ({
        type: "GroupCommandUpdate",
        id: this.groups[0].id,
      }),
      () => ({
        type: TYPE_GROUP,
        operatorId: this.users[5].id,
        id: this.groups[0].id,
      })
    ),
    new WriteTaskFailure<GroupCommand, NotFoundError, GroupCommandUpdate>(
      "update: not found",
      () => this.getAuthUser(0),
      () => ({
        type: "GroupCommandUpdate",
        id: "no-id",
      }),
      ({ command }) => ({ type: TYPE_GROUP, id: command.id })
    ),
    new WriteTaskFailure<
      GroupCommand,
      NoExpectedScopeError,
      GroupCommandUpdate
    >(
      "update: no scope",
      () => this.getAuthUser(0, []),
      () => ({
        type: "GroupCommandUpdate",
        id: this.groups[0].id,
      }),
      ({ authUser }) => ({
        operatorId: authUser.user?.id,
        scope: this.service.writeScope,
      })
    ),
    new WriteTaskFailure<
      GroupCommand,
      NoExpectedScopeError,
      GroupCommandUpdate
    >(
      "update: no scope",
      () => this.getAuthUser(0, []),
      () => ({
        type: "GroupCommandUpdate",
        id: this.groups[0].id,
      }),
      ({ authUser }) => ({
        operatorId: authUser.user?.id,
        scope: this.service.writeScope,
      })
    ),
    new WriteTaskSuccess<GroupCommand, Group, GroupCommandDelete>(
      "delete",
      () => this.getAuthUser(2),
      () => ({
        type: "GroupCommandDelete",
        id: this.groups[0].id,
      }),
      ({ result }) => expect(result).toBeFalsy()
    ),
  ];
}

function check<CC extends GroupCommand>(
  command: CC,
  result?: Group,
  options?: Partial<CC>
): void {
  if (command.type === "GroupCommandCreate") {
    if (result != null) {
      expect({
        name: result.name,
        description: result.description,
        admins: result.admins.map((u) => u.id),
        members: result.members.map((u) => u.id),
      }).toStrictEqual({
        name: command.name,
        description: command.description,
        admins: command.admins,
        members: command.members,
        ...options,
      });
    } else {
      fail("No group created");
    }
  } else if (command.type === "GroupCommandUpdate") {
    if (result != null) {
      const adminIds = result.admins.map((u) => u.id);
      const memberIds = result.members.map((u) => u.id);
      expect({
        id: result.id,
        name: result.name,
        description: result.description,
        admins: adminIds,
        members: memberIds,
      }).toStrictEqual({
        id: command.id,
        name: command.name ?? result.name,
        description: command.description ?? result.description,
        admins: command.admins ?? adminIds,
        members: command.members ?? memberIds,
        ...options,
      });
    } else {
      fail(`Group[${command.id}] failed to update`);
    }
  }
}
