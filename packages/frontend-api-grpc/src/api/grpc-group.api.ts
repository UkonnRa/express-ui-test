import { GroupApi, GroupCommand, GroupModel } from "@white-rabbit/frontend-api";
import { inject, singleton } from "tsyringe";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import { GroupServiceClient } from "../proto/group.client";
import { Command, Group } from "../proto/group";
import AbstractApi from "./abstract-api";

@singleton()
export default class GrpcGroupApi
  extends AbstractApi<
    GroupModel,
    GroupCommand,
    Group,
    Command,
    GroupServiceClient
  >
  implements GroupApi
{
  constructor(@inject(GrpcWebFetchTransport) transport: GrpcWebFetchTransport) {
    super(new GroupServiceClient(transport));
  }

  override modelFromProto(model: Group): GroupModel {
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
    };
  }

  override commandToProto(command: GroupCommand): Command {
    switch (command.type) {
      case "CreateGroupCommand":
        return {
          command: {
            oneofKind: "create",
            create: command,
          },
        };
      case "UpdateGroupCommand":
        return {
          command: {
            oneofKind: "update",
            update: {
              ...command,
              admins:
                command.admins == null
                  ? undefined
                  : {
                      items: command.admins,
                    },
              members:
                command.members == null
                  ? undefined
                  : {
                      items: command.members,
                    },
            },
          },
        };
      case "DeleteGroupCommand":
        return {
          command: {
            oneofKind: "delete",
            delete: command,
          },
        };
    }
  }
}
