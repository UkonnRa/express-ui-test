import { inject, singleton } from "tsyringe";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { JournalApi, JournalModel } from "@white-rabbit/frontend-api";
import { User as OidcUser } from "oidc-client-ts";
import {
  AccessItemTypeValue,
  JournalQuery,
  JournalCommand,
  AccessItemInput,
  AccessItemValue,
} from "@white-rabbit/types";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import { JournalServiceClient } from "../proto/journal.client";
import {
  AccessItemInput as AccessItemInputProto,
  Command,
  Journal,
} from "../proto/journal";
import {
  AccessItemType,
  AccessItem as AccessItemProto,
} from "../proto/access-item";
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

function accessItemsFromProto(items: AccessItemProto[]): AccessItemValue[] {
  return items.map((item) => ({
    ...item,
    type: accessItemTypeFromProto(item.type),
  }));
}

function accessItemsToProto(items: AccessItemInput[]): AccessItemInputProto[] {
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
    JournalQuery,
    Journal,
    Command,
    JournalServiceClient
  >
  implements JournalApi<OidcUser>
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
