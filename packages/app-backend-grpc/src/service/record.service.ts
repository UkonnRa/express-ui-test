import { inject, singleton } from "tsyringe";
import {
  RecordService as CoreRecordService,
  RecordEntity,
  RecordCommand,
  RecordTypeValue,
} from "@white-rabbit/business-logic";
import {
  Collection,
  EntityDTO,
  EntityManager,
  MikroORM,
} from "@mikro-orm/core";

import { Command, Record, Type } from "../proto/record";
import { IRecordService } from "../proto/record.server";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import AbstractService from "./abstract-service";

function typeFromProto(type: Type): RecordTypeValue {
  switch (type) {
    case Type.CHECK:
      return RecordTypeValue.CHECK;
    case Type.RECORD:
      return RecordTypeValue.RECORD;
  }
}

function typeToProto(type: RecordTypeValue): Type {
  switch (type) {
    case RecordTypeValue.CHECK:
      return Type.CHECK;
    case RecordTypeValue.RECORD:
      return Type.RECORD;
  }
}

@singleton()
export default class RecordService
  extends AbstractService<
    RecordEntity,
    RecordCommand,
    CoreRecordService,
    Record,
    Command
  >
  implements IRecordService
{
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(CoreRecordService)
    recordService: CoreRecordService
  ) {
    super(orm, recordService);
  }

  override getCommand({ command }: Command): RecordCommand {
    switch (command.oneofKind) {
      case "create":
        return {
          ...command.create,
          type: "CreateRecordCommand",
          recordType: typeFromProto(command.create.type),
          timestamp:
            command.create.timestamp == null
              ? new Date()
              : Timestamp.toDate(command.create.timestamp),
        };
      case "update":
        return {
          ...command.update,
          type: "UpdateRecordCommand",
          recordType:
            command.update.type == null
              ? undefined
              : typeFromProto(command.update.type),
          timestamp:
            command.update.timestamp == null
              ? undefined
              : Timestamp.toDate(command.update.timestamp),
          tags: command.update.tags?.items,
          items:
            command.update.items == null
              ? undefined
              : command.update.items.items,
        };
      case "delete":
        return {
          type: "DeleteRecordCommand",
          targetId: command.delete.targetId,
        };
      default:
        throw new Error(`No such command`);
    }
  }

  override async getModel(
    entity: EntityDTO<RecordEntity> | RecordEntity,
    em: EntityManager
  ): Promise<Record> {
    return {
      ...entity,
      createdAt: Timestamp.fromDate(entity.createdAt),
      updatedAt: Timestamp.fromDate(entity.updatedAt),
      journal: entity.journal.id,
      type: typeToProto(entity.type),
      timestamp: Timestamp.fromDate(entity.timestamp),
      tags: entity.tags,
      items: (entity.items instanceof Collection
        ? entity.items.getItems()
        : entity.items
      ).map((item) => ({ ...item, account: item.account.id })),
      isValid: await this.service.isValid(entity, em),
    };
  }
}
