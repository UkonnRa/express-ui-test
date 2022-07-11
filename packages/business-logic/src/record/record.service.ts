import {
  EntityDTO,
  EntityManager,
  MikroORM,
  ObjectQuery,
} from "@mikro-orm/core";
import { inject, singleton } from "tsyringe";
import {
  AccountTypeValue,
  AdditionalQuery,
  CreateRecordCommand,
  DeleteRecordCommand,
  FULL_TEXT_OPERATOR,
  RecordCommand,
  RecordQuery,
  RecordTypeValue,
  UpdateRecordCommand,
  RecordItemValue as OriginalRecordItemValue,
  RECORD_READ_SCOPE,
  RECORD_WRITE_SCOPE,
} from "@white-rabbit/types";
import _ from "lodash";
import { AuthUser, checkCreate, CommandInput, WriteService } from "../shared";
import { JournalService } from "../journal";
import { AccountEntity, AccountService } from "../account";
import { NotFoundError } from "../error";
import { filterAsync, fullTextSearch } from "../utils";
import RecordEntity, { RECORD_TYPE } from "./record.entity";
import RecordItemValue from "./record-item.value";

@singleton()
export default class RecordService extends WriteService<
  RecordEntity,
  RecordCommand,
  RecordQuery
> {
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(AccountService) private readonly accountService: AccountService,
    @inject(JournalService) private readonly journalService: JournalService
  ) {
    super(
      orm,
      RECORD_TYPE,
      RecordEntity,
      RECORD_READ_SCOPE,
      RECORD_WRITE_SCOPE,
      ["CreateRecordCommand"]
    );
  }

  private async createRecordItems(
    authUser: AuthUser,
    record: RecordEntity,
    items: OriginalRecordItemValue[],
    em: EntityManager
  ): Promise<RecordItemValue[]> {
    const accounts: Record<string, AccountEntity> = Object.fromEntries(
      (
        await this.accountService.findAll(
          { authUser, query: { id: items.map(({ account }) => account) } },
          em
        )
      ).map((account) => [account.id, account])
    );

    return items
      .map((item) =>
        accounts[item.account] != null
          ? new RecordItemValue(
              record,
              accounts[item.account],
              item.amount,
              item.price
            )
          : undefined
      )
      .filter((item): item is RecordItemValue => item != null);
  }

  private async createRecord(
    authUser: AuthUser,
    command: CreateRecordCommand,
    em: EntityManager
  ): Promise<RecordEntity> {
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

    const entity = new RecordEntity(
      journal,
      command.name,
      command.description,
      command.recordType,
      command.timestamp,
      command.tags
    );

    const items = await this.createRecordItems(
      authUser,
      entity,
      command.items,
      em
    );
    entity.items.set(items);

    em.persist(entity);
    return entity;
  }

  private async updateRecord(
    authUser: AuthUser,
    command: UpdateRecordCommand,
    em: EntityManager
  ): Promise<RecordEntity> {
    const entity = await this.getWriteableEntity(
      authUser,
      command.targetId,
      em
    );

    if (
      command.name == null &&
      command.description == null &&
      command.recordType == null &&
      command.timestamp == null &&
      command.tags == null &&
      command.items == null
    ) {
      return entity;
    }

    if (command.name != null) {
      entity.name = command.name;
    }

    if (command.description != null) {
      entity.description = command.description;
    }

    if (command.recordType != null) {
      entity.type = command.recordType;
    }

    if (command.timestamp != null) {
      entity.timestamp = command.timestamp;
    }

    if (command.tags != null) {
      entity.tags = command.tags;
    }

    if (command.items != null) {
      const items = await this.createRecordItems(
        authUser,
        entity,
        command.items,
        em
      );
      entity.items.set(items);
    }

    em.persist(entity);
    return entity;
  }

  private async deleteRecord(
    authUser: AuthUser,
    command: DeleteRecordCommand,
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
    { command, authUser }: CommandInput<RecordCommand>,
    em: EntityManager
  ): Promise<RecordEntity | null> {
    switch (command.type) {
      case "CreateRecordCommand":
        return this.createRecord(authUser, command, em);
      case "UpdateRecordCommand":
        return this.updateRecord(authUser, command, em);
      case "DeleteRecordCommand":
        return this.deleteRecord(authUser, command, em).then(() => null);
    }
  }

  async isValid(
    record: RecordEntity | EntityDTO<RecordEntity>,
    em: EntityManager
  ): Promise<boolean> {
    let items: Array<EntityDTO<RecordItemValue>>;
    if (record instanceof RecordEntity) {
      items = record.items.toJSON();
    } else {
      items = record.items;
    }

    if (record.type === RecordTypeValue.RECORD) {
      const balance = items
        .map((item) => {
          switch (item.account.type) {
            case AccountTypeValue.ASSET:
            case AccountTypeValue.EXPENSE:
              return item.price ?? item.amount;
            default:
              return (item.price ?? item.amount) * -1;
          }
        })
        .reduce((a, b) => a + b);
      return Math.abs(balance) < Number.EPSILON;
    } else {
      const currentItem = items[0];
      if (currentItem == null) {
        return false;
      }

      const prevItems = await em.find(
        RecordEntity,
        {
          items: { account: currentItem.account },
          timestamp: { $lte: record.timestamp },
          type: RecordTypeValue.RECORD,
        },
        {
          populate: ["items"],
        }
      );
      const balance = prevItems
        .flatMap((item) => item.items.getItems())
        .filter((item) => item.account.id === currentItem.account.id)
        .reduce((a, b) => a + b.amount, 0);
      return Math.abs(balance - currentItem.amount) < Number.EPSILON;
    }
  }

  async checkWriteable(
    entity: RecordEntity,
    authUser: AuthUser
  ): Promise<void> {
    await super.checkWriteable(entity, authUser);
    await this.journalService.checkWriteable(entity.journal, authUser);
  }

  async isReadable(entity: RecordEntity, authUser: AuthUser): Promise<boolean> {
    return this.journalService.isReadable(entity.journal, authUser);
  }

  override async handleAdditionalQuery(
    authUser: AuthUser,
    entities: RecordEntity[],
    query: AdditionalQuery
  ): Promise<RecordEntity[]> {
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
    query: RecordQuery
  ): [AdditionalQuery[], ObjectQuery<RecordEntity>] {
    const additionalQuery: AdditionalQuery[] = [];
    const objectQuery: ObjectQuery<RecordEntity> = {};

    for (const [key, value] of Object.entries(query)) {
      if (key === FULL_TEXT_OPERATOR && _.isEmpty(value)) {
        additionalQuery.push({
          type: "FullTextQuery",
          value,
          fields: ["name", "description", "tags"],
        });
      } else if (key === "id" && _.isEmpty(value)) {
        objectQuery.id = value;
      } else if (key === "journal" && _.isEmpty(value)) {
        objectQuery.journal = value;
      } else if (key === "name") {
        if (typeof value === "string" && _.isEmpty(value)) {
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
      } else if (key === "description" && _.isEmpty(value)) {
        additionalQuery.push({
          type: "FullTextQuery",
          value,
          fields: ["description"],
        });
      } else if (key === "type") {
        objectQuery.type = value;
      } else if (key === "timestamp" && _.isEmpty(value)) {
        objectQuery.timestamp = value;
      } else if (key === "tags") {
        if (
          FULL_TEXT_OPERATOR in value &&
          !_.isEmpty(value[FULL_TEXT_OPERATOR])
        ) {
          additionalQuery.push({
            type: "FullTextQuery",
            value: value[FULL_TEXT_OPERATOR],
            fields: ["tags"],
          });
        } else if (
          (typeof value === "string" || value instanceof Array) &&
          _.isEmpty(value)
        ) {
          objectQuery.tags = value;
        }
      }
    }

    return [additionalQuery, objectQuery];
  }
}
