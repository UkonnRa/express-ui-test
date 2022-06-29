import { inject, singleton } from "tsyringe";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import {
  AccessItemTypeValue,
  AccessItemValue,
  JournalApi,
  JournalCommand,
  JournalModel,
} from "@white-rabbit/frontend-api";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import { JournalServiceClient } from "../proto/journal.client";
import { AccessItem, AccessItemType, Command, Journal } from "../proto/journal";
import AbstractApi from "./abstract-api";

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

function accessItemsFromProto(items: AccessItem[]): AccessItemValue[] {
  return items.map((item) => ({
    ...item,
    type: accessItemTypeFromProto(item.type),
  }));
}

function accessItemsToProto(items: AccessItemValue[]): AccessItem[] {
  return items.map((item) => ({
    ...item,
    type: accessItemTypeToProto(item.type),
  }));
}

@singleton()
export default class GrpcJournalApi
  extends AbstractApi<
    JournalModel,
    JournalCommand,
    Journal,
    Command,
    JournalServiceClient
  >
  implements JournalApi
{
  constructor(@inject(GrpcWebFetchTransport) transport: GrpcWebFetchTransport) {
    super(new JournalServiceClient(transport));
  }

  override modelFromProto(model: Journal): JournalModel {
    return {
      ...model,
      createdAt:
        model.createdAt == null
          ? new Date(0)
          : Timestamp.toDate(model.createdAt),
      updatedAt:
        model.updatedAt == null
          ? new Date(0)
          : Timestamp.toDate(model.updatedAt),
      admins: accessItemsFromProto(model.admins),
      members: accessItemsFromProto(model.members),
    };
  }

  override commandToProto(command: JournalCommand): Command {
    switch (command.type) {
      case "CreateJournalCommand":
        return {
          command: {
            oneofKind: "create",
            create: {
              ...command,
              admins: accessItemsToProto(command.admins),
              members: accessItemsToProto(command.members),
            },
          },
        };
      case "UpdateJournalCommand":
        return {
          command: {
            oneofKind: "update",
            update: {
              ...command,
              tags: command.tags == null ? undefined : { items: command.tags },
              admins:
                command.admins == null
                  ? undefined
                  : { values: accessItemsToProto(command.admins) },
              members:
                command.members == null
                  ? undefined
                  : { values: accessItemsToProto(command.members) },
            },
          },
        };
      case "DeleteJournalCommand":
        return {
          command: {
            oneofKind: "delete",
            delete: command,
          },
        };
    }
  }
}
