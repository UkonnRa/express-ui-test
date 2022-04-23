import { inject, singleton } from "tsyringe";
import {
  FinItemValue,
  FinRecordValue,
  TYPE_FIN_RECORD,
} from "@white-rabbit/type-bridge";
import AbstractService from "../../shared/abstract-service";
import { AccountRepository, FinRecordRepository } from "../index";
import { AuthUser } from "../../shared/auth-user";
import JournalService from "../journal/journal-service";
import { FinRecord } from "./fin-record";
import { FinRecordQuery } from "./fin-record-query";
import {
  FinRecordCommand,
  FinRecordCommandCreate,
  FinRecordCommandDelete,
  FinRecordCommandUpdate,
} from "./fin-record-command";
import { FinItemCreateOptions } from "./fin-item";

@singleton()
export default class FinRecordService extends AbstractService<
  FinRecord,
  FinRecordRepository,
  FinRecordValue,
  FinRecordQuery,
  FinRecordCommand
> {
  constructor(
    @inject("FinRecordRepository")
    protected override readonly repository: FinRecordRepository,
    private readonly journalService: JournalService,
    @inject("AccountRepository")
    private readonly accountRepository: AccountRepository
  ) {
    super(TYPE_FIN_RECORD, "finRecords:read", "finRecords:write", repository);
  }

  private async getItems(
    values: FinItemValue[]
  ): Promise<FinItemCreateOptions[]> {
    const accounts = await this.accountRepository.findByIds(
      values.map(({ account }) => account)
    );
    const result: FinItemCreateOptions[] = [];
    for (const { account, amount, unit, price, note } of values) {
      const accountValue = accounts.get(account);
      if (accountValue != null) {
        result.push({ account: accountValue, amount, unit, price, note });
      }
    }
    return result;
  }

  async createFinRecord(
    authUser: AuthUser,
    command: FinRecordCommandCreate
  ): Promise<string> {
    this.checkScope(authUser);
    const journal = await this.journalService.getEntity(
      authUser,
      command.journal,
      false
    );
    const finRecord = new FinRecord({
      timestamp: command.timestamp,
      journal,
      name: command.name,
      description: command.description,
      items: await this.getItems(command.items),
      tags: command.tags,
      isContingent: command.isContingent,
    });
    await this.repository.save(finRecord);
    return finRecord.id;
  }

  async updateFinRecord(
    authUser: AuthUser,
    {
      id,
      timestamp,
      name,
      description,
      items,
      tags,
      isContingent,
    }: FinRecordCommandUpdate
  ): Promise<string> {
    const entity = await this.getEntity(authUser, id);
    if (
      timestamp == null &&
      name == null &&
      description == null &&
      items == null &&
      tags == null &&
      isContingent == null
    ) {
      return entity.id;
    }

    if (timestamp != null) {
      entity.timestamp = timestamp;
    }

    if (name != null) {
      entity.name = name;
    }

    if (description != null) {
      entity.description = description;
    }

    if (items != null) {
      entity.setItemWithOptions(await this.getItems(items));
    }

    if (tags != null) {
      entity.tags = tags;
    }

    if (isContingent != null) {
      entity.isContingent = isContingent;
    }

    await this.repository.save(entity);

    return entity.id;
  }

  async deleteFinRecord(
    authUser: AuthUser,
    { id }: FinRecordCommandDelete
  ): Promise<string> {
    const entity = await this.getEntity(authUser, id);

    entity.deleted = true;

    await this.repository.save(entity);
    return entity.id;
  }

  async handle(authUser: AuthUser, command: FinRecordCommand): Promise<string> {
    if (command.type === "FinRecordCommandCreate") {
      return this.createFinRecord(authUser, command);
    } else if (command.type === "FinRecordCommandUpdate") {
      return this.updateFinRecord(authUser, command);
    } else {
      return this.deleteFinRecord(authUser, command);
    }
  }
}
