import { inject, singleton } from "tsyringe";
import AbstractService from "../../shared/abstract-service";
import AuthUser from "../../shared/auth-user";
import { AccountRepository } from "../index";
import JournalService from "../journal/journal-service";
import { AccountQuery } from "./account-query";
import { Account } from "./account";
import {
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
  AccountQuery
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
  ): Promise<void> {
    const entity = await this.getEntity(authUser, id);

    if (
      name == null &&
      description == null &&
      accountType == null &&
      unit == null &&
      strategy == null
    ) {
      return;
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
  }

  async deleteAccount(
    authUser: AuthUser,
    { id }: AccountCommandDelete
  ): Promise<void> {
    const entity = await this.getEntity(authUser, id);
    entity.deleted = true;
    await this.repository.save(entity);
  }
}
