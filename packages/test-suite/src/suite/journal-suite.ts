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
} from "@white-rabbit/business-logic";
import { inject, singleton } from "tsyringe";
import {
  ReadTask,
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
            id: this.users[3].id,
          },
        ],
        members: [
          {
            type: TYPE_GROUP,
            id: this.groups[1].id,
          },
        ],
      }),
      ({ command, result }) => check(command, result)
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
  ];
}

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
      expect({
        id: result.id,
        name: result.name,
        description: result.description,
        admins: Journal.toAccessListValue(result.admins),
        members: Journal.toAccessListValue(result.members),
      }).toStrictEqual({
        id: command.id,
        name: command.name ?? result.name,
        description: command.description ?? result.description,
        admins: command.admins ?? result.admins,
        members: command.members ?? result.members,
        ...options,
      });
    } else {
      fail(`Journal[${command.id}] failed to update`);
    }
  }
}
