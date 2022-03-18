import { inject, singleton } from "tsyringe";
import AbstractService from "../../shared/abstract-service";
import AuthUser from "../../shared/auth-user";
import { AccountRepository } from "../index";
import JournalService from "../journal/journal-service";
import { AccountQuery } from "./account-query";
import { Account } from "./account";
import {
  AccountCommand,
  AccountCommandCreate,
  AccountCommandDelete,
  AccountCommandUpdate,
  AccountValue,
} from "./index";

@singleton()
export default class AccountService extends AbstractService<
  Account,
  AccountRepository,
  AccountValue,
  AccountQuery,
  AccountCommand
> {
  constructor(
    @inject("AccountRepository")
    protected override readonly repository: AccountRepository,
    private readonly journalService: JournalService
  ) {
    super("Account", "accounts:read", "accounts:write", repository);
  }

  async createAccount(
    authUser: AuthUser,
    {
      name,
      description,
      journal,
      accountType,
      unit,
      strategy,
    }: AccountCommandCreate
  ): Promise<string> {
    this.checkScope(authUser);

    const journalEntity = await this.journalService.getEntity(
      authUser,
      journal,
      false
    );

    const entity = new Account({
      name,
      description,
      journal: journalEntity,
      accountType,
      unit,
      strategy,
    });

    await this.repository.save(entity);

    return entity.id;
  }

  async updateAccount(
    authUser: AuthUser,
    { id, name, description, accountType, unit, strategy }: AccountCommandUpdate
  ): Promise<string> {
    const entity = await this.getEntity(authUser, id);

    if (
      name == null &&
      description == null &&
      accountType == null &&
      unit == null &&
      strategy == null
    ) {
      return entity.id;
    }

    if (name != null) {
      entity.name = name;
    }

    if (description != null) {
      entity.description = description;
    }

    if (accountType != null) {
      entity.accountType = accountType;
    }

    if (unit != null) {
      entity.unit = unit;
    }

    if (strategy != null) {
      entity.strategy = strategy;
    }

    await this.repository.save(entity);

    return entity.id;
  }

  async deleteAccount(
    authUser: AuthUser,
    { id }: AccountCommandDelete
  ): Promise<string> {
    const entity = await this.getEntity(authUser, id);
    entity.deleted = true;
    await this.repository.save(entity);
    return entity.id;
  }

  async handle(authUser: AuthUser, command: AccountCommand): Promise<string> {
    if (command.type === "AccountCommandCreate") {
      return this.createAccount(authUser, command);
    } else if (command.type === "AccountCommandUpdate") {
      return this.updateAccount(authUser, command);
    } else {
      return this.deleteAccount(authUser, command);
    }
  }
}
