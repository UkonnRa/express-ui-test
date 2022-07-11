import { inject, singleton } from "tsyringe";
import { EntityManager, MikroORM, ObjectQuery } from "@mikro-orm/core";
import {
  ACCOUNT_READ_SCOPE,
  ACCOUNT_WRITE_SCOPE,
  AccountCommand,
  AccountQuery,
  AdditionalQuery,
  CreateAccountCommand,
  DeleteAccountCommand,
  FULL_TEXT_OPERATOR,
  UpdateAccountCommand,
} from "@white-rabbit/types";
import _ from "lodash";
import { AuthUser, checkCreate, CommandInput, WriteService } from "../shared";
import { JournalService } from "../journal";
import { AlreadyArchivedError, NotFoundError } from "../error";
import { filterAsync, fullTextSearch } from "../utils";
import AccountEntity, { ACCOUNT_TYPE } from "./account.entity";

@singleton()
export default class AccountService extends WriteService<
  AccountEntity,
  AccountCommand,
  AccountQuery
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

  async doHandle(
    { authUser, command }: CommandInput<AccountCommand>,
    em: EntityManager
  ): Promise<AccountEntity | null> {
    switch (command.type) {
      case "CreateAccountCommand":
        return this.createAccount(authUser, command, em);
      case "UpdateAccountCommand":
        return this.updateAccount(authUser, command, em);
      case "DeleteAccountCommand":
        return this.deleteAccount(authUser, command, em).then(() => null);
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
    return this.journalService.isReadable(entity.journal, authUser);
  }

  async handleAdditionalQuery(
    authUser: AuthUser,
    entities: AccountEntity[],
    query: AdditionalQuery
  ): Promise<AccountEntity[]> {
    if (query.type === "FullTextQuery") {
      return filterAsync(entities, async (entity) =>
        fullTextSearch(entity, query)
      );
    } else {
      return super.handleAdditionalQuery(authUser, entities, query);
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  override doGetQueries(
    query: AccountQuery
  ): [AdditionalQuery[], ObjectQuery<AccountEntity>] {
    const additionalQuery: AdditionalQuery[] = [];
    const objectQuery: ObjectQuery<AccountEntity> = {};

    if (query.includeArchived !== true) {
      objectQuery.archived = false;
    }

    for (const [key, value] of Object.entries(query)) {
      if (key === FULL_TEXT_OPERATOR && !_.isEmpty(value)) {
        additionalQuery.push({
          type: "FullTextQuery",
          value,
          fields: ["name", "description"],
        });
      } else if (key === "id" && !_.isEmpty(value)) {
        objectQuery.id = value;
      } else if (key === "journal" && !_.isEmpty(value)) {
        objectQuery.journal = value;
      } else if (key === "name") {
        if (typeof value === "string" && !_.isEmpty(value)) {
          objectQuery.name = value;
        } else if (
          FULL_TEXT_OPERATOR in value &&
          !_.isEmpty(value[FULL_TEXT_OPERATOR])
        ) {
          additionalQuery.push({
            type: "FullTextQuery",
            value: value[FULL_TEXT_OPERATOR],
            fields: ["name"],
          });
        }
      } else if (key === "description" && !_.isEmpty(value)) {
        additionalQuery.push({
          type: "FullTextQuery",
          value,
          fields: ["description"],
        });
      } else if (key === "type") {
        objectQuery.type = value;
      } else if (key === "strategy") {
        objectQuery.strategy = value;
      } else if (key === "unit" && !_.isEmpty(value)) {
        objectQuery.unit = value;
      }
    }

    return [additionalQuery, objectQuery];
  }
}
