import {
  AbstractEntity,
  AbstractRepository,
  AbstractService,
  Account,
  AccountCreateOptions,
  AccountRepository,
  AuthId,
  AuthUser,
  Group,
  GroupCreateOptions,
  GroupRepository,
  Journal,
  JournalCreateOptions,
  JournalRepository,
  User,
  UserRepository,
} from "@white-rabbit/business-logic";
import each from "jest-each";
import dayjs from "dayjs";
import { AccountType, Pagination, Strategy } from "@white-rabbit/type-bridge";
import faker from "@faker-js/faker";
import { ReadTask, WriteTask } from "../task";
import { generateUsers } from "../data/generate-user";
import { UserMatcher } from "./index";

export abstract class AbstractSuite<
  T extends AbstractEntity<T, V>,
  R extends AbstractRepository<T, V, Q>,
  S extends AbstractService<T, R, V, Q, C>,
  V,
  Q,
  C
> {
  protected readonly userRepository: UserRepository;
  protected readonly groupRepository: GroupRepository;
  protected readonly journalRepository: JournalRepository;
  protected readonly accountRepository: AccountRepository;

  protected constructor(
    readonly type: symbol,
    readonly repository: R,
    readonly service: S
  ) {}

  protected abstract writeTasks: Array<WriteTask<C, T>>;

  protected abstract readTasks: Array<ReadTask<T, Q, V>>;

  protected users: User[];

  protected groups: Group[];

  protected journals: Journal[];

  protected accounts: Account[];

  private async prepareData(): Promise<void> {
    this.userRepository.close();
    this.groupRepository.close();
    this.journalRepository.close();
    this.accountRepository.close();

    this.users = generateUsers(20);
    await this.userRepository.saveAll(this.users);

    const groups: Group[] = [
      {
        name: "Group 1",
        description: "Group 1 Description - foo, bar",
        admins: [this.users[3], this.users[4]],
        members: [this.users[0], this.users[1]],
      },
      {
        name: "Group 2",
        description: "Group 2 Description - bar, baz",
        admins: [this.users[4], this.users[5]],
        members: [this.users[2], this.users[3]],
      },
      {
        name: "Group 3",
        description: "Group 3 Description - baz, foo",
        admins: [this.users[0], this.users[2]],
        members: [this.users[1], this.users[5]],
      },
      {
        name: "Group 4",
        description: "Group 4 Description - bar, foo",
        admins: [this.users[1], this.users[5]],
        members: [this.users[3], this.users[4]],
      },
    ].map((options: GroupCreateOptions, idx) => {
      const group = new Group(options);
      group.id = `group-id-${idx}`;
      return group;
    });
    await this.groupRepository.saveAll(groups);
    this.groups = groups;

    const journals: Journal[] = (
      [
        {
          name: "Journal 1",
          description: "Journal 1 Description",
          admins: [this.users[0], this.users[1]],
          members: [groups[0]],
          startDate: dayjs("2020-01-01"),
          endDate: dayjs("2020-02-01"),
        },
        {
          name: "Journal 2",
          description: "Journal 2 Description",
          admins: [this.users[0], this.users[1]],
          members: [this.users[2], this.users[3]],
        },
        {
          name: "Journal 3",
          description: "Journal 3 Description",
          admins: [this.users[1], groups[1]],
          members: [groups[0]],
          startDate: dayjs("2020-01-15"),
          endDate: dayjs("2020-02-15"),
        },
        {
          name: "Journal 4",
          description: "Journal 4 Description",
          admins: [this.users[1]],
          members: [groups[0]],
          startDate: dayjs("2020-01-15"),
          archived: true,
        },
      ] as JournalCreateOptions[]
    ).map((options: JournalCreateOptions, idx) => {
      const journal = new Journal(options);
      journal.id = `journal-id-${idx}`;
      return journal;
    });
    await this.journalRepository.saveAll(journals);
    this.journals = journals;

    const accounts: Account[] = (
      [
        {
          name: ["Journal 1", "Asset", "Account 1", "关键词一"],
          description: "Journal 1 - Account 1 Description",
          journal: this.journals[0],
          accountType: AccountType.ASSET,
          unit: "CNY",
          strategy: Strategy.AVERAGE,
        },
        {
          name: ["Journal 1", "Expense", "Account 2", "关键词二"],
          description: "Journal 1 - Account 2 Description",
          journal: this.journals[0],
          accountType: AccountType.EXPENSE,
          unit: "CNY",
          strategy: Strategy.AVERAGE,
        },
        {
          name: ["Journal 1", "Equity", "Account 3", "关键词三"],
          description: "Journal 1 - Account 3 Description",
          journal: this.journals[0],
          accountType: AccountType.EQUITY,
          unit: "NVDA",
          strategy: Strategy.FIFO,
        },
        {
          name: ["Journal 1", "Income", "Account 4", "关键词四"],
          description: "Journal 1 - Account 4 Description",
          journal: this.journals[0],
          accountType: AccountType.INCOME,
          unit: "USD",
          strategy: Strategy.AVERAGE,
        },
        {
          name: ["Journal 1", "Income", "Account 5", "关键词五"],
          description: "Journal 1 - Account 5 Description",
          journal: this.journals[0],
          accountType: AccountType.LIABILITY,
          unit: "CNY",
          strategy: Strategy.AVERAGE,
        },
        {
          name: ["Journal 2", "Asset", "Account 1", "关键词六"],
          description: "Journal 2 - Account 1 Description",
          journal: this.journals[1],
          accountType: AccountType.ASSET,
          unit: "CNY",
          strategy: Strategy.AVERAGE,
        },
      ] as AccountCreateOptions[]
    ).map((options: AccountCreateOptions, idx) => {
      const account = new Account(options);
      account.id = `account-id-${idx}`;
      return account;
    });
    await this.accountRepository.saveAll(accounts);
    this.accounts = accounts;
  }

  protected getAuthUser(
    query: UserMatcher | AuthId = {},
    scopes: string[] = [this.service.readScope, this.service.writeScope]
  ): AuthUser {
    let authId: AuthId;
    let user: User | undefined;

    if ("provider" in query && "id" in query) {
      authId = query;
    } else {
      user = faker.helpers.arrayElement(this.queryUsers(query));
      const [provider, id] = faker.helpers.arrayElement([...user.authIds]);
      authId = { provider, id };
    }

    return new AuthUser(authId, scopes, user);
  }

  protected queryUsers = (query: UserMatcher): User[] =>
    this.users.filter(
      (u) =>
        (query.authId != null
          ? u.authIds.get(query.authId.id) === query.authId.provider
          : true) &&
        (query.role != null ? u.role === query.role : true) &&
        (query.containDeleted === true ? true : !u.deleted)
    );

  // eslint-disable-next-line sonarjs/cognitive-complexity
  start(): void {
    if (this.readTasks.length <= 0 && this.writeTasks.length <= 0) {
      return;
    }

    beforeAll(async () => {
      await this.prepareData();
    });

    if (this.readTasks.length > 0) {
      each(this.readTasks).test(
        `Read task for ${String(this.type.description)}: $name`,
        async (task: ReadTask<T, Q, V>) => {
          const authUser = task.authUserHandler();
          if (task.readType === "Single") {
            const input = task.inputHandler(authUser);
            if (task.type === "Success") {
              const result = await this.service.findValueById(authUser, input);
              task.handler({ input, authUser, result });
            } else {
              await expect(async () =>
                this.service.findValueById(authUser, input)
              ).rejects.toMatchObject(task.errorHandler({ input, authUser }));
            }
          } else {
            const input = task.inputHandler(authUser);
            if (task.type === "Success") {
              const result = await this.service.findAllValues(
                authUser,
                input.sort,
                input.pagination,
                input.query
              );
              task.handler({
                input,
                authUser,
                result: { page: result, position: "current" },
              });
              if (task.expectedResult.previous !== undefined) {
                const p: Pagination = {
                  size: input.pagination.size,
                  before: result.pageInfo.startCursor,
                  startFrom: "LAST",
                };
                const i = { ...input, pagination: p };
                const prevResult = await this.service.findAllValues(
                  authUser,
                  i.sort,
                  i.pagination,
                  i.query
                );
                task.handler({
                  input: i,
                  authUser,
                  result: { page: prevResult, position: "previous" },
                });
              }
              if (task.expectedResult.next !== undefined) {
                const p: Pagination = {
                  size: input.pagination.size,
                  after: result.pageInfo.endCursor,
                  startFrom: "FIRST",
                };
                const i = { ...input, pagination: p };
                const nextResult = await this.service.findAllValues(
                  authUser,
                  i.sort,
                  i.pagination,
                  i.query
                );
                task.handler({
                  input: i,
                  authUser,
                  result: { page: nextResult, position: "next" },
                });
              }
            } else {
              await expect(async () =>
                this.service.findAllValues(
                  authUser,
                  input.sort,
                  input.pagination,
                  input.query
                )
              ).rejects.toMatchObject(task.errorHandler({ input, authUser }));
            }
          }
        }
      );
    }

    if (this.writeTasks.length > 0) {
      each(this.writeTasks).test(
        `Write task for ${String(this.type.description)}: $name`,
        async (task: WriteTask<C, T>) => {
          await this.prepareData();
          if (task.setup !== undefined) {
            await task.setup();
          }
          const authUser = task.authUserHandler();
          const command = task.inputHandler(authUser);
          if (task.type === "Success") {
            const id = await this.service.handle(authUser, command);
            const result = await this.repository.findById(id);
            task.handler({ command, authUser, result });
          } else {
            await expect(async () =>
              this.service.handle(authUser, command)
            ).rejects.toMatchObject(task.errorHandler({ command, authUser }));
          }
          if (task.setup !== undefined) {
            await this.prepareData();
          }
        }
      );
    }
  }
}
