import { inject, singleton } from "tsyringe";
import {
  Page,
  RoleValue,
  UserCommand,
  UserEntity,
  UserService as CoreUserService,
} from "@white-rabbit/business-logic";
import { EntityDTO, MikroORM } from "@mikro-orm/core";
import { BaseClient } from "openid-client";
import { Command, Role, User, UserPage, UserResponse } from "../proto/user";
import { IUserService } from "../proto/user.server";
import AbstractService from "./abstract-service";

function getRole(role: Role): RoleValue {
  switch (role) {
    case Role.OWNER:
      return RoleValue.OWNER;
    case Role.ADMIN:
      return RoleValue.ADMIN;
    case Role.USER:
      return RoleValue.USER;
  }
}

@singleton()
export default class UserService
  extends AbstractService<
    UserEntity,
    UserCommand,
    CoreUserService,
    Command,
    UserResponse,
    UserPage
  >
  implements IUserService
{
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(BaseClient) oidcClient: BaseClient,
    @inject(CoreUserService) userService: CoreUserService
  ) {
    super(orm, oidcClient, userService, userService);
  }

  override getCommand({ command }: Command): UserCommand {
    switch (command.oneofKind) {
      case "create":
        return {
          type: "CreateUserCommand",
          targetId: command.create.id,
          name: command.create.name,
          role:
            command.create.role != null
              ? getRole(command.create.role)
              : undefined,
          authIds: command.create.authIds,
        };
      case "update":
        return {
          type: "UpdateUserCommand",
          targetId: command.update.id,
          name: command.update.name,
          role:
            command.update.role != null
              ? getRole(command.update.role)
              : undefined,
          authIds: command.update.authIds?.values,
        };
      case "delete":
        return {
          type: "DeleteUserCommand",
          targetId: command.delete.id,
        };
      default:
        throw new Error(`No such command`);
    }
  }

  override getPageResponse(page: Page<UserEntity>): UserPage {
    return UserPage.fromJsonString(JSON.stringify(page));
  }

  override getResponse(
    entity: EntityDTO<UserEntity> | UserEntity | null
  ): UserResponse {
    return {
      user:
        entity == null
          ? undefined
          : User.fromJsonString(JSON.stringify(entity)),
    };
  }
}
