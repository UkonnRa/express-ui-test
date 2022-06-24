import { inject, singleton } from "tsyringe";
import {
  UserService as CoreUserService,
  RecordService as CoreRecordService,
  RecordEntity,
  RecordCommand,
  Page,
  RecordTypeValue,
} from "@white-rabbit/business-logic";
import { EntityDTO, MikroORM } from "@mikro-orm/core";

import { BaseClient } from "openid-client";
import {
  Command,
  Record,
  RecordPage,
  RecordResponse,
  Type,
} from "../proto/record";
import { IRecordService } from "../proto/record.server";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import AbstractService from "./abstract-service";

function getType(type: Type): RecordTypeValue {
  switch (type) {
    case Type.CHECK:
      return RecordTypeValue.CHECK;
    case Type.RECORD:
      return RecordTypeValue.RECORD;
  }
}

@singleton()
export default class RecordService
  extends AbstractService<
    RecordEntity,
    RecordCommand,
    CoreRecordService,
    Command,
    RecordResponse,
    RecordPage
  >
  implements IRecordService
{
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(BaseClient) oidcClient: BaseClient,
    @inject(CoreUserService)
    userService: CoreUserService,
    @inject(CoreRecordService) recordService: CoreRecordService
  ) {
    super(orm, oidcClient, userService, recordService);
  }

  override getCommand({ command }: Command): RecordCommand {
    switch (command.oneofKind) {
      case "create":
        return {
          type: "CreateRecordCommand",
          targetId: command.create.id,
          journal: command.create.journal,
          name: command.create.name,
          description: command.create.description,
          recordType: getType(command.create.type),
          timestamp:
            command.create.timestamp == null
              ? new Date()
              : Timestamp.toDate(command.create.timestamp),
          tags: new Set(command.create.tags),
          items: command.create.items,
        };
      case "update":
        return {
          type: "UpdateRecordCommand",
          targetId: command.update.id,
          name: command.update.name,
          description: command.update.description,
          recordType:
            command.update.type == null
              ? undefined
              : getType(command.update.type),
          timestamp:
            command.update.timestamp == null
              ? undefined
              : Timestamp.toDate(command.update.timestamp),
          tags:
            command.update.tags == null
              ? undefined
              : new Set(command.update.tags.items),
          items:
            command.update.items == null
              ? undefined
              : command.update.items.items,
        };
      case "delete":
        return {
          type: "DeleteRecordCommand",
          targetId: command.delete.id,
        };
      default:
        throw new Error(`No such command`);
    }
  }

  getPageResponse(page: Page<RecordEntity>): RecordPage {
    return RecordPage.fromJsonString(JSON.stringify(page));
  }

  getResponse(
    entity: EntityDTO<RecordEntity> | RecordEntity | null
  ): RecordResponse {
    return {
      record:
        entity == null
          ? undefined
          : Record.fromJsonString(JSON.stringify(entity)),
    };
  }
}
