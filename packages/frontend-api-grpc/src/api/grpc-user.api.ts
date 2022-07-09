import { UserApi, UserModel } from "@white-rabbit/frontend-api";
import { inject, singleton } from "tsyringe";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { User as OidcUser } from "oidc-client-ts";
import { RoleValue, UserCommand, UserQuery } from "@white-rabbit/types";
import { UserServiceClient } from "../proto/user.client";
import { Command, Role, User } from "../proto/user";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import AbstractApi from "./abstract-api";

const roleFromProto = (role: Role): RoleValue => {
  switch (role) {
    case Role.OWNER:
      return RoleValue.OWNER;
    case Role.ADMIN:
      return RoleValue.ADMIN;
    case Role.USER:
      return RoleValue.USER;
  }
};

const roleToProto = (role: RoleValue): Role => {
  switch (role) {
    case RoleValue.OWNER:
      return Role.OWNER;
    case RoleValue.ADMIN:
      return Role.ADMIN;
    case RoleValue.USER:
      return Role.USER;
  }
};

@singleton()
export default class GrpcUserApi
  extends AbstractApi<
    UserModel,
    UserCommand,
    UserQuery,
    User,
    Command,
    UserServiceClient
  >
  implements UserApi<OidcUser>
{
  constructor(@inject(GrpcWebFetchTransport) transport: GrpcWebFetchTransport) {
    super(new UserServiceClient(transport));
  }

  override modelFromProto(model: User): UserModel {
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
      role: roleFromProto(model.role),
    };
  }

  override commandToProto(command: UserCommand): Command {
    switch (command.type) {
      case "CreateUserCommand":
        return {
          command: {
            oneofKind: "create",
            create: {
              ...command,
              role:
                command.role == null ? undefined : roleToProto(command.role),
              authIds:
                command.authIds == null
                  ? undefined
                  : {
                      values: command.authIds,
                    },
            },
          },
        };
      case "UpdateUserCommand":
        return {
          command: {
            oneofKind: "update",
            update: {
              ...command,
              role:
                command.role == null ? undefined : roleToProto(command.role),
              authIds:
                command.authIds == null
                  ? undefined
                  : {
                      values: command.authIds,
                    },
            },
          },
        };
      case "DeleteUserCommand":
        return {
          command: {
            oneofKind: "delete",
            delete: command,
          },
        };
    }
  }
}
