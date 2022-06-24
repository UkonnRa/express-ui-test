import { inject, singleton } from "tsyringe";
import {
  UserService as CoreUserService,
  GroupService as CoreGroupService,
  GroupEntity,
  GroupCommand,
  Page,
} from "@white-rabbit/business-logic";
import { EntityDTO, MikroORM } from "@mikro-orm/core";

import { BaseClient } from "openid-client";
import { IGroupService } from "../proto/group.server";
import { Command, Group, GroupPage, GroupResponse } from "../proto/group";
import AbstractService from "./abstract-service";

@singleton()
export default class GroupService
  extends AbstractService<
    GroupEntity,
    GroupCommand,
    CoreGroupService,
    Command,
    GroupResponse,
    GroupPage
  >
  implements IGroupService
{
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(BaseClient) oidcClient: BaseClient,
    @inject(CoreUserService)
    userService: CoreUserService,
    @inject(CoreGroupService) groupService: CoreGroupService
  ) {
    super(orm, oidcClient, userService, groupService);
  }

  override getCommand({ command }: Command): GroupCommand {
    switch (command.oneofKind) {
      case "create":
        return {
          type: "CreateGroupCommand",
          targetId: command.create.id,
          name: command.create.name,
          description: command.create.description,
          admins: command.create.admins,
          members: command.create.members,
        };
      case "update":
        return {
          type: "UpdateGroupCommand",
          targetId: command.update.id,
          name: command.update.description,
          description: command.update.description,
          admins: command.update.admins?.items,
          members: command.update.members?.items,
        };
      case "delete":
        return {
          type: "DeleteGroupCommand",
          targetId: command.delete.id,
        };
      default:
        throw new Error(`No such command`);
    }
  }

  getPageResponse(page: Page<GroupEntity>): GroupPage {
    return GroupPage.fromJsonString(JSON.stringify(page));
  }

  getResponse(
    entity: EntityDTO<GroupEntity> | GroupEntity | null
  ): GroupResponse {
    return {
      group:
        entity == null
          ? undefined
          : Group.fromJsonString(JSON.stringify(entity)),
    };
  }
}
