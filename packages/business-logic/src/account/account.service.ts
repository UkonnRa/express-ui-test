import { inject } from "tsyringe";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import { AuthUser, checkCreate, CommandInput, WriteService } from "../shared";
import { JournalService } from "../journal";
import { AlreadyArchivedError, NotFoundError } from "../error";
import AccountCommand from "./account.command";
import AccountEntity, { ACCOUNT_TYPE } from "./account.entity";
import CreateAccountCommand from "./create-account.command";
import UpdateAccountCommand from "./update-account.command";
import DeleteAccountCommand from "./delete-account.command";

export const ACCOUNT_READ_SCOPE = "white-rabbit_accounts_read";
export const ACCOUNT_WRITE_SCOPE = "white-rabbit_accounts_write";

export default class AccountService extends WriteService<
  AccountEntity,
  AccountCommand
> {
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(JournalService) private readonly journalService: JournalService
  ) {
    super(
      orm,
      ACCOUNT_TYPE,
      AccountEntity,
      ACCOUNT_READ_SCOPE,
      ACCOUNT_WRITE_SCOPE,
      ["CreateAccountCommand"]
    );
  }

  async createAccount(
    authUser: AuthUser,
    command: CreateAccountCommand,
    em: EntityManager
  ): Promise<AccountEntity> {
    await checkCreate(
      this.type,
      this.entityName,
      authUser,
      this.writeScope,
      {
        journal: command.journal,
        name: command.name,
      },
      em
    );

    const journal = await this.journalService.findOne({
      authUser,
      query: { id: command.journal },
    });
    if (journal == null) {
      throw new NotFoundError(this.journalService.type, command.journal);
    }

    const entity = new AccountEntity(
      journal,
      command.name,
      command.description,
      command.accountType,
      command.strategy,
      command.unit
    );

    em.persist(entity);
    return entity;
  }

  private async updateAccount(
    authUser: AuthUser,
    command: UpdateAccountCommand,
    em: EntityManager
  ): Promise<AccountEntity> {
    const entity = await this.getWriteableEntity(
      authUser,
      command.targetId,
      em
    );

    if (
      command.name == null &&
      command.description == null &&
      command.accountType == null &&
      command.strategy == null &&
      command.unit == null
    ) {
      return entity;
    }

    if (command.name != null) {
      entity.name = command.name;
    }

    if (command.description != null) {
      entity.description = command.description;
    }

    if (command.accountType != null) {
      entity.type = command.accountType;
    }

    if (command.strategy != null) {
      entity.strategy = command.strategy;
    }

    if (command.unit != null) {
      entity.unit = command.unit;
    }

    em.persist(entity);
    return entity;
  }

  private async deleteAccount(
    authUser: AuthUser,
    command: DeleteAccountCommand,
    em: EntityManager
  ): Promise<void> {
    const entity = await this.getWriteableEntity(
      authUser,
      command.targetId,
      em
    );

    await em.removeAndFlush(entity);
  }

  async handle(
    { authUser, command }: CommandInput<AccountCommand>,
    em?: EntityManager
  ): Promise<AccountEntity | null> {
    const emInst = em ?? this.orm.em.fork();
    switch (command.type) {
      case "CreateAccountCommand":
        return this.createAccount(authUser, command, emInst);
      case "UpdateAccountCommand":
        return this.updateAccount(authUser, command, emInst);
      case "DeleteAccountCommand":
        return this.deleteAccount(authUser, command, emInst).then(() => null);
    }
  }

  async checkWriteable(
    entity: AccountEntity,
    authUser: AuthUser
  ): Promise<void> {
    await super.checkWriteable(entity, authUser);
    await this.journalService.checkWriteable(entity.journal, authUser);
    if (entity.archived) {
      throw new AlreadyArchivedError(this.type, entity.id);
    }
  }

  async isReadable(
    entity: AccountEntity,
    authUser: AuthUser
  ): Promise<boolean> {
    return (
      (await super.isReadable(entity, authUser)) &&
      this.journalService.isReadable(entity.journal, authUser)
    );
  }
}
