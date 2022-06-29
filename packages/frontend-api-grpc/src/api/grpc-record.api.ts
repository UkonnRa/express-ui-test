import { inject, singleton } from "tsyringe";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import {
  RecordApi,
  RecordCommand,
  RecordModel,
  RecordTypeValue,
} from "@white-rabbit/frontend-api";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import { Command, Record, Type } from "../proto/record";
import { RecordServiceClient } from "../proto/record.client";
import AbstractApi from "./abstract-api";

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
export default class GrpcRecordApi
  extends AbstractApi<
    RecordModel,
    RecordCommand,
    Record,
    Command,
    RecordServiceClient
  >
  implements RecordApi
{
  constructor(@inject(GrpcWebFetchTransport) transport: GrpcWebFetchTransport) {
    super(new RecordServiceClient(transport));
  }

  override modelFromProto(model: Record): RecordModel {
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
      type: typeFromProto(model.type),
      timestamp:
        model.timestamp == null
          ? new Date(0)
          : Timestamp.toDate(model.timestamp),
    };
  }

  override commandToProto(command: RecordCommand): Command {
    switch (command.type) {
      case "CreateRecordCommand":
        return {
          command: {
            oneofKind: "create",
            create: {
              ...command,
              type: typeToProto(command.recordType),
              timestamp: Timestamp.fromDate(command.timestamp),
            },
          },
        };
      case "UpdateRecordCommand":
        return {
          command: {
            oneofKind: "update",
            update: {
              ...command,
              type:
                command.recordType == null
                  ? undefined
                  : typeToProto(command.recordType),
              timestamp:
                command.timestamp == null
                  ? undefined
                  : Timestamp.fromDate(command.timestamp),
              tags: command.tags == null ? undefined : { items: command.tags },
              items:
                command.items == null ? undefined : { items: command.items },
            },
          },
        };
      case "DeleteRecordCommand":
        return {
          command: {
            oneofKind: "delete",
            delete: command,
          },
        };
    }
  }
}
