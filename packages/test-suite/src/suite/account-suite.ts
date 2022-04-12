import {
  Account,
  AccountCommand,
  AccountCommandCreate,
  AccountQuery,
  AccountRepository,
  AccountService,
  AccountType,
  AccountValue,
  GroupRepository,
  JournalRepository,
  JournalService,
  Strategy,
  TYPE_ACCOUNT,
  UserRepository,
} from "@white-rabbit/business-logic";
import { inject, singleton } from "tsyringe";
import {
  ReadTask,
  ReadTaskSingleSuccess,
  WriteTask,
  WriteTaskSuccess,
} from "../task";
import { AbstractSuite } from "./abstract-suite";

@singleton()
export class AccountSuite extends AbstractSuite<
  Account,
  AccountRepository,
  AccountService,
  AccountValue,
  AccountQuery,
  AccountCommand
> {
  constructor(
    @inject("UserRepository") override readonly userRepository: UserRepository,
    @inject("GroupRepository")
    override readonly groupRepository: GroupRepository,
    @inject("JournalRepository")
    override readonly journalRepository: JournalRepository,
    @inject("AccountRepository")
    override readonly accountRepository: AccountRepository,
    accountService: AccountService,
    private readonly journalService: JournalService
  ) {
    super(TYPE_ACCOUNT, accountRepository, accountService);
  }

  override readTasks: Array<ReadTask<Account, AccountQuery, AccountValue>> = [
    new ReadTaskSingleSuccess<AccountValue>(
      "find self by ID",
      () => this.getAuthUser(0),
      () => this.accounts[0].id,
      ({ result }) => expect(result.name).toBe(this.accounts[0].name)
    ),
  ];

  override writeTasks: Array<WriteTask<AccountCommand, Account>> = [
    new WriteTaskSuccess<AccountCommand, Account, AccountCommandCreate>(
      "create when login",
      () =>
        this.getAuthUser(0, [
          this.service.readScope,
          this.service.writeScope,
          this.journalService.readScope,
        ]),
      () => ({
        type: "AccountCommandCreate",
        name: ["New Name 1", "New Name 2", "New Name 3"],
        description: "New Description",
        journal: this.journals[0].id,
        accountType: AccountType.ASSET,
        unit: "CNY",
        strategy: Strategy.FIFO,
      }),
      ({ command, result }) => check(command, result)
    ),
  ];
}

function check<CC extends AccountCommand>(
  command: CC,
  result?: Account,
  options?: Partial<CC>
): void {
  if (command.type === "AccountCommandCreate") {
    if (result != null) {
      expect({
        name: result.name,
        description: result.description,
        journal: result.journal.id,
        accountType: result.accountType,
        unit: result.unit,
        strategy: result.strategy,
      }).toStrictEqual({
        name: command.name,
        description: command.description,
        journal: command.journal,
        accountType: command.accountType,
        unit: command.unit,
        strategy: command.strategy,
        ...options,
      });
    } else {
      fail("No journal created");
    }
  } else if (command.type === "AccountCommandUpdate") {
    if (result != null) {
      expect({
        name: result.name,
        description: result.description,
        accountType: result.accountType,
        unit: result.unit,
        strategy: result.strategy,
      }).toStrictEqual({
        id: command.id,
        name: command.name ?? result.name,
        description: command.description ?? result.description,
        accountType: command.accountType ?? result.accountType,
        unit: command.unit ?? result.unit,
        strategy: command.strategy ?? result.strategy,
        ...options,
      });
    } else {
      fail(`Journal[${command.id}] failed to update`);
    }
  }
}
