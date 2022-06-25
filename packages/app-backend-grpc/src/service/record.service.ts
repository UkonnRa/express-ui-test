import { inject, singleton } from "tsyringe";
import {
  UserService as CoreUserService,
  RecordService as CoreRecordService,
  RecordEntity,
  RecordCommand,
  RecordTypeValue,
} from "@white-rabbit/business-logic";
import { Collection, EntityDTO, MikroORM } from "@mikro-orm/core";

import { type BaseClient } from "openid-client";
import { Command, Record, Type } from "../proto/record";
import { IRecordService } from "../proto/record.server";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import AbstractService from "./abstract-service";
import { KEY_OIDC_CLIENT } from "./types";

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
    @inject(KEY_OIDC_CLIENT) oidcClient: BaseClient,
    @inject(CoreUserService)
    userService: CoreUserService,
    @inject(CoreRecordService)
    recordService: CoreRecordService
  ) {
    super(orm, oidcClient, userService, recordService);
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

  override getModel(entity: EntityDTO<RecordEntity> | RecordEntity): Record {
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
    };
  }
}
