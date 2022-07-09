import { inject, singleton } from "tsyringe";
import {
  UserEntity,
  UserService as CoreUserService,
} from "@white-rabbit/business-logic";
import { EntityDTO, MikroORM } from "@mikro-orm/core";
import { RoleValue, UserCommand, UserQuery } from "@white-rabbit/types";
import { Command, Role, User } from "../proto/user";
import { IUserService } from "../proto/user.server";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import AbstractService from "./abstract-service";

function roleFromProto(role: Role): RoleValue {
  switch (role) {
    case Role.OWNER:
      return RoleValue.OWNER;
    case Role.ADMIN:
      return RoleValue.ADMIN;
    case Role.USER:
      return RoleValue.USER;
  }
}

function roleToProto(role: RoleValue): Role {
  switch (role) {
    case RoleValue.OWNER:
      return Role.OWNER;
    case RoleValue.ADMIN:
      return Role.ADMIN;
    case RoleValue.USER:
      return Role.USER;
  }
}

@singleton()
export default class UserService
  extends AbstractService<
    UserEntity,
    UserCommand,
    UserQuery,
    CoreUserService,
    User,
    Command
  >
  implements IUserService
{
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(CoreUserService)
    userService: CoreUserService
  ) {
    super(orm, userService);
  }

  override getCommand({ command }: Command): UserCommand {
    switch (command.oneofKind) {
      case "create":
        return {
          type: "CreateUserCommand",
          targetId: command.create.targetId,
          name: command.create.name,
          role:
            command.create.role != null
              ? roleFromProto(command.create.role)
              : undefined,
          authIds: command.create.authIds?.values,
        };
      case "update":
        return {
          type: "UpdateUserCommand",
          targetId: command.update.targetId,
          name: command.update.name,
          role:
            command.update.role != null
              ? roleFromProto(command.update.role)
              : undefined,
          authIds: command.update.authIds?.values,
        };
      case "delete":
        return {
          type: "DeleteUserCommand",
          targetId: command.delete.targetId,
        };
      default:
        throw new Error(`No such command`);
    }
  }

  override async getModel(
    entity: EntityDTO<UserEntity> | UserEntity
  ): Promise<User> {
    return {
      ...entity,
      createdAt: Timestamp.fromDate(entity.createdAt),
      updatedAt: Timestamp.fromDate(entity.updatedAt),
      role: roleToProto(entity.role),
    };
  }
}
