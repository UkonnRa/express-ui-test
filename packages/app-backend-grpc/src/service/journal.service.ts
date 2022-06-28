import { inject, singleton } from "tsyringe";
import {
  JournalService as CoreJournalService,
  JournalEntity,
  JournalCommand,
  AccessItemTypeValue,
  AccessItemInput,
} from "@white-rabbit/business-logic";
import { EntityDTO, MikroORM } from "@mikro-orm/core";

import { AccessItem, AccessItemType, Command, Journal } from "../proto/journal";
import { IJournalService } from "../proto/journal.server";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import AbstractService from "./abstract-service";

function accessItemTypeFromProto(type: AccessItemType): AccessItemTypeValue {
  switch (type) {
    case AccessItemType.GROUP:
      return AccessItemTypeValue.GROUP;
    case AccessItemType.USER:
      return AccessItemTypeValue.USER;
  }
}

function accessItemTypeToProto(type: AccessItemTypeValue): AccessItemType {
  switch (type) {
    case AccessItemTypeValue.GROUP:
      return AccessItemType.GROUP;
    case AccessItemTypeValue.USER:
      return AccessItemType.USER;
  }
}

function accessItemsFromProto(items: AccessItem[]): AccessItemInput[] {
  return items.map(({ type, id }) => ({
    type: accessItemTypeFromProto(type),
    id,
  }));
}

function accessItemsToProto(items: AccessItemInput[]): AccessItem[] {
  return items.map(({ type, id }) => ({
    type: accessItemTypeToProto(type),
    id,
  }));
}

@singleton()
export default class JournalService
  extends AbstractService<
    JournalEntity,
    JournalCommand,
    CoreJournalService,
    Journal,
    Command
  >
  implements IJournalService
{
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(CoreJournalService)
    journalService: CoreJournalService
  ) {
    super(orm, journalService);
  }

  override getCommand({ command }: Command): JournalCommand {
    switch (command.oneofKind) {
      case "create":
        return {
          ...command.create,
          type: "CreateJournalCommand",
          admins: accessItemsFromProto(command.create.admins),
          members: accessItemsFromProto(command.create.members),
        };
      case "update":
        return {
          ...command.update,
          type: "UpdateJournalCommand",
          tags: command.update.tags?.items,
          admins:
            command.update.admins == null
              ? undefined
              : accessItemsFromProto(command.update.admins.values),
          members:
            command.update.members == null
              ? undefined
              : accessItemsFromProto(command.update.members.values),
        };
      case "delete":
        return {
          type: "DeleteJournalCommand",
          targetId: command.delete.targetId,
        };
      default:
        throw new Error(`No such command`);
    }
  }

  override getModel(entity: EntityDTO<JournalEntity> | JournalEntity): Journal {
    return {
      ...entity,
      createdAt: Timestamp.fromDate(entity.createdAt),
      updatedAt: Timestamp.fromDate(entity.updatedAt),
      tags: entity.tags,
      admins: accessItemsToProto(entity.admins),
      members: accessItemsToProto(entity.members),
    };
  }
}
