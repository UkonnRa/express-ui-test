import {
  GroupRepository,
  JournalRepository,
  UserRepository,
  JournalService,
  User,
  Role,
  TYPE_USER,
  TYPE_JOURNAL,
  Journal,
  JournalValue,
  JournalQuery,
  JournalCommand,
  JournalCommandCreate,
  FieldValidationLengthError,
  TYPE_GROUP,
  JournalQueryFuzzySearch,
  JournalQueryFullText,
  NotFoundError,
  JournalCommandUpdate,
  JournalCommandDelete,
  FieldStartEndDateMismatchError,
  InvalidCursorError,
  InvalidQueryError,
  InvalidSortFieldError,
  FieldNotQueryableError,
} from "@white-rabbit/business-logic";
import { inject, singleton } from "tsyringe";
import dayjs from "dayjs";
import {
  ReadTask,
  ReadTaskPageFailure,
  ReadTaskPageSuccess,
  ReadTaskSingleFailure,
  ReadTaskSingleSuccess,
  WriteTask,
  WriteTaskFailure,
  WriteTaskSuccess,
} from "../task";
import { AbstractSuite } from "./abstract-suite";

@singleton()
export class JournalSuite extends AbstractSuite<
  Journal,
  JournalRepository,
  JournalService,
  JournalValue,
  JournalQuery,
  JournalCommand
> {
  constructor(
    @inject("UserRepository") override readonly userRepository: UserRepository,
    @inject("GroupRepository")
    override readonly groupRepository: GroupRepository,
    @inject("JournalRepository")
    override readonly journalRepository: JournalRepository,
    journalService: JournalService
  ) {
    super(TYPE_JOURNAL, journalRepository, journalService);
  }

  override readTasks: Array<ReadTask<Journal, JournalQuery, JournalValue>> = [
    new ReadTaskSingleSuccess<JournalValue>(
      "find self by ID",
      () => this.getAuthUser(0),
      () => this.journals[0].id,
      ({ result }) => expect(result.name).toBe(this.journals[0].name)
    ),
    new ReadTaskSingleFailure<NotFoundError>(
      "find self by ID: no permission",
      () => this.getAuthUser(5),
      () => this.journals[0].id,
      ({ input }) => ({ name: "NotFound", type: TYPE_JOURNAL, id: input })
    ),
    new ReadTaskPageSuccess<
      Journal,
      JournalQuery,
      JournalValue,
      JournalQueryFuzzySearch
    >(
      "find all by fuzzy search",
      () => this.getAuthUser(0),
      () => ({
        sort: [
          { field: "startDate", order: "ASC" },
          { field: "name", order: "ASC" },
        ],
        pagination: { size: 2, startFrom: "FIRST" },
        query: {
          type: "JournalQueryFuzzySearch",
          includingArchived: true,
          startDate: dayjs("2020-01-14").toDate(),
          endDate: dayjs("2020-02-14").toDate(),
        },
      }),
      () => this.journals,
      {
        next: [2, 3],
        current: [1, 0],
      }
    ),
    new ReadTaskPageSuccess<
      Journal,
      JournalQuery,
      JournalValue,
      JournalQueryFullText
    >(
      "find all by full text search",
      () => this.getAuthUser(4),
      () => ({
        sort: [
          { field: "startDate", order: "ASC" },
          { field: "name", order: "ASC" },
        ],
        pagination: { size: 2, startFrom: "FIRST" },
        query: {
          type: "JournalQueryFullText",
          keyword: {
            value: "Journal",
          },
        },
      }),
      () => this.journals,
      {
        current: [0, 2],
        next: [3],
      }
    ),
    new ReadTaskPageFailure<
      JournalQuery,
      InvalidCursorError,
      JournalQueryFullText
    >(
      "find all: invalid cursor",
      () => this.getAuthUser(0),
      () => ({
        sort: [
          { field: "startDate", order: "ASC" },
          { field: "name", order: "ASC" },
        ],
        pagination: { size: 2, startFrom: "FIRST", after: "+-" },
        query: {
          type: "JournalQueryFullText",
          keyword: {
            value: "Journal",
          },
        },
      }),
      ({ input }) => ({ name: "InvalidCursor", cursor: input.pagination.after })
    ),
    new ReadTaskPageFailure<unknown, InvalidQueryError>(
      "find all: query is undefined",
      () => this.getAuthUser(4),
      () => ({
        sort: [
          { field: "startDate", order: "ASC" },
          { field: "name", order: "ASC" },
        ],
        pagination: { size: 2, startFrom: "FIRST" },
        query: undefined,
      }),
      () => ({ name: "InvalidQuery", query: undefined })
    ),
    new ReadTaskPageFailure<unknown, InvalidQueryError>(
      "find all: query is empty",
      () => this.getAuthUser(4),
      () => ({
        sort: [
          { field: "startDate", order: "ASC" },
          { field: "name", order: "ASC" },
        ],
        pagination: { size: 2, startFrom: "FIRST" },
        query: {},
      }),
      () => ({ name: "InvalidQuery", query: "{}" })
    ),
    new ReadTaskPageFailure<unknown, InvalidSortFieldError>(
      "find all: invalid sort field",
      () => this.getAuthUser(0),
      () => ({
        sort: [{ field: "not a field", order: "ASC" }],
        pagination: { size: 2, startFrom: "FIRST" },
        query: {},
      }),
      ({ input }) => ({
        name: "InvalidSortField",
        type: TYPE_JOURNAL,
        field: input.sort[0].field,
      })
    ),
    new ReadTaskPageFailure<
      JournalQuery,
      FieldNotQueryableError,
      JournalQueryFullText
    >(
      "find all: field not queryable",
      () => this.getAuthUser(0),
      () => ({
        sort: [{ field: "name", order: "ASC" }],
        pagination: { size: 2, startFrom: "FIRST" },
        query: {
          type: "JournalQueryFullText",
          keyword: {
            fields: ["not-a-field"],
            value: "Journal",
          },
        },
      }),
      ({ input }) => ({
        name: "FieldNotQueryable",
        type: TYPE_JOURNAL,
        field: input.query?.keyword?.fields?.at(0),
      })
    ),
  ];

  override writeTasks: Array<WriteTask<JournalCommand, Journal>> = [
    new WriteTaskSuccess<JournalCommand, Journal, JournalCommandCreate>(
      "create when login",
      () => this.getAuthUser(3),
      () => ({
        type: "JournalCommandCreate",
        name: "New Name",
        description: "New Description",
        admins: [
          {
            type: TYPE_USER,
            id: this.users[2].id,
          },
        ],
        members: [
          {
            type: TYPE_GROUP,
            id: this.groups[1].id,
          },
        ],
        startDate: dayjs("2020-01-01").toDate(),
      }),
      ({ command, result }) =>
        check(command, result, {
          admins: [
            ...command.admins,
            {
              type: TYPE_USER,
              id: this.users[3].id,
            },
          ],
        })
    ),
    new WriteTaskFailure<
      JournalCommand,
      FieldValidationLengthError,
      JournalCommandCreate
    >(
      "create: too many members",
      () => this.getAuthUser(0),
      () => {
        return {
          type: "JournalCommandCreate",
          name: "New Name",
          description: "New Description",
          admins: this.users
            .filter((u) => u.isReadable())
            .map((u) => ({ type: TYPE_USER, id: u.id })),
          members: [
            {
              type: TYPE_GROUP,
              id: this.groups[1].id,
            },
          ],
        };
      },
      () => ({ type: TYPE_JOURNAL, field: "admins", max: 16 }),
      async () => {
        const users: User[] = Array.from(
          { length: 16 },
          (_, idx) => new User({ name: `New User ${idx}`, role: Role.USER })
        );
        await this.userRepository.saveAll(users);
        this.users.push(...users);
      }
    ),
    new WriteTaskFailure<JournalCommand, NotFoundError, JournalCommandCreate>(
      "create: without valid auth user instance",
      () =>
        this.getAuthUser({
          provider: "New Provider 1",
          id: "Provider ID",
        }),
      () => ({
        type: "JournalCommandCreate",
        name: "New Name 1",
        description: "New Description 1",
        admins: [
          {
            type: TYPE_USER,
            id: this.users[2].id,
          },
        ],
        members: [
          {
            type: TYPE_GROUP,
            id: this.groups[1].id,
          },
        ],
      }),
      ({ authUser }) => ({ type: TYPE_USER, id: authUser.authIdValue })
    ),
    new WriteTaskFailure<
      JournalCommand,
      FieldValidationLengthError,
      JournalCommandCreate
    >(
      "create: invalid name length",
      () => this.getAuthUser(0),
      () => ({
        type: "JournalCommandCreate",
        name: "a",
        description: "New Description",
        admins: [
          {
            type: TYPE_USER,
            id: this.users[2].id,
          },
        ],
        members: [
          {
            type: TYPE_GROUP,
            id: this.groups[1].id,
          },
        ],
      }),
      () => ({ type: TYPE_JOURNAL, field: "name" })
    ),
    new WriteTaskFailure<
      JournalCommand,
      FieldStartEndDateMismatchError,
      JournalCommandCreate
    >(
      "create: invalid start&end pair",
      () => this.getAuthUser(0),
      () => ({
        type: "JournalCommandCreate",
        name: "New Name 3",
        description: "New Description 3",
        admins: [
          {
            type: TYPE_USER,
            id: this.users[2].id,
          },
        ],
        members: [
          {
            type: TYPE_GROUP,
            id: this.groups[1].id,
          },
        ],
        startDate: dayjs("2020-02-01").toDate(),
        endDate: dayjs("2020-01-01").toDate(),
      }),
      ({ command }) => ({
        type: TYPE_JOURNAL,
        startField: "startDate",
        startValue: command.startDate,
        endField: "endDate",
        endValue: command.endDate,
      })
    ),
    new WriteTaskSuccess<JournalCommand, Journal, JournalCommandUpdate>(
      "update",
      () => this.getAuthUser(0),
      () => ({
        type: "JournalCommandUpdate",
        id: this.journals[2].id,
        name: "New Name",
        description: "New Description",
        admins: [
          {
            type: TYPE_USER,
            id: this.users[2].id,
          },
        ],
        members: [
          {
            type: TYPE_GROUP,
            id: this.groups[1].id,
          },
        ],
        startDate: {
          type: "SET",
          value: dayjs("2020-03-15").toDate(),
        },
        endDate: {
          type: "UNSET",
        },
      }),
      ({ command, result }) => check(command, result)
    ),
    new WriteTaskSuccess<JournalCommand, Journal, JournalCommandUpdate>(
      "update date",
      () => this.getAuthUser(0),
      () => ({
        type: "JournalCommandUpdate",
        id: this.journals[2].id,
        startDate: {
          type: "UNSET",
        },
        endDate: {
          type: "SET",
          value: dayjs("2020-01-01").toDate(),
        },
      }),
      ({ command, result }) => check(command, result)
    ),
    new WriteTaskSuccess<JournalCommand, Journal, JournalCommandUpdate>(
      "update nothing",
      () => this.getAuthUser(0),
      () => ({
        type: "JournalCommandUpdate",
        id: this.journals[0].id,
      }),
      ({ command, result }) => check(command, result)
    ),
    new WriteTaskFailure<
      JournalCommand,
      FieldStartEndDateMismatchError,
      JournalCommandUpdate
    >(
      "update: date mismatch",
      () => this.getAuthUser(0),
      () => ({
        type: "JournalCommandUpdate",
        id: this.journals[2].id,
        startDate: {
          type: "SET",
          value: dayjs("2020-03-15").toDate(),
        },
      }),
      () => ({
        type: TYPE_JOURNAL,
        startField: "startDate",
        startValue: dayjs("2020-03-15").toDate(),
        endField: "endDate",
        endValue: this.journals[2].endDate,
      })
    ),
    new WriteTaskSuccess<JournalCommand, Journal, JournalCommandDelete>(
      "delete",
      () => this.getAuthUser(0),
      () => ({
        type: "JournalCommandDelete",
        id: this.journals[0].id,
      }),
      ({ result }) => expect(result).toBeFalsy()
    ),
  ];
}

const checkDate = (
  command: JournalCommandUpdate,
  result: Journal,
  field: "startDate" | "endDate"
): void => {
  const commandDate = command[field];
  if (commandDate != null) {
    if (commandDate.type === "SET") {
      expect(result[field]).toBe(commandDate.value);
    } else {
      expect(result[field]).toBeFalsy();
    }
  }
};

function check<CC extends JournalCommand>(
  command: CC,
  result?: Journal,
  options?: Partial<CC>
): void {
  if (command.type === "JournalCommandCreate") {
    if (result != null) {
      expect({
        name: result.name,
        description: result.description,
        admins: Journal.toAccessListValue(result.admins),
        members: Journal.toAccessListValue(result.members),
      }).toStrictEqual({
        name: command.name,
        description: command.description,
        admins: command.admins,
        members: command.members,
        ...options,
      });
    } else {
      fail("No journal created");
    }
  } else if (command.type === "JournalCommandUpdate") {
    if (result != null) {
      const adminValues = Journal.toAccessListValue(result.admins);
      const memberValues = Journal.toAccessListValue(result.members);
      expect({
        id: result.id,
        name: result.name,
        description: result.description,
        admins: adminValues,
        members: memberValues,
      }).toStrictEqual({
        id: command.id,
        name: command.name ?? result.name,
        description: command.description ?? result.description,
        admins: command.admins ?? adminValues,
        members: command.members ?? memberValues,
        ...options,
      });
      checkDate(command, result, "startDate");
      checkDate(command, result, "endDate");
    } else {
      fail(`Journal[${command.id}] failed to update`);
    }
  }
}
