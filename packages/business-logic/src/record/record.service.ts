import { EntityManager, MikroORM } from "@mikro-orm/core";
import { inject } from "tsyringe";
import { AuthUser, checkCreate, CommandInput, WriteService } from "../shared";
import { JournalService } from "../journal";
import { AccountEntity, AccountService, AccountTypeValue } from "../account";
import { NotFoundError } from "../error";
import RecordCommand from "./record.command";
import RecordEntity, { RECORD_TYPE } from "./record.entity";
import RecordTypeValue from "./record-type.value";
import CreateRecordCommand from "./create-record.command";
import RecordItemValue from "./record-item.value";
import CreateRecordItemValue from "./create-record-item.value";
import UpdateRecordCommand from "./update-record.command";
import DeleteRecordCommand from "./delete-record.command";

export const RECORD_READ_SCOPE = "white-rabbit_records_read";
export const RECORD_WRITE_SCOPE = "white-rabbit_records_write";

export default class RecordService extends WriteService<
  RecordEntity,
  RecordCommand
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
    items: CreateRecordItemValue[],
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

  async handle(
    { command, authUser }: CommandInput<RecordCommand>,
    em?: EntityManager
  ): Promise<RecordEntity | null> {
    const emInst = em ?? this.orm.em.fork();
    switch (command.type) {
      case "CreateRecordCommand":
        return this.createRecord(authUser, command, emInst);
      case "UpdateRecordCommand":
        return this.updateRecord(authUser, command, emInst);
      case "DeleteRecordCommand":
        return this.deleteRecord(authUser, command, emInst).then(() => null);
    }
  }

  async isValid(record: RecordEntity, em: EntityManager): Promise<boolean> {
    const items = await record.items.loadItems();
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
        .filter((item) => item.account === currentItem.account)
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
    return (
      (await super.isReadable(entity, authUser)) &&
      this.journalService.isReadable(entity.journal, authUser)
    );
  }
}
