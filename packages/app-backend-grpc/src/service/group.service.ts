import { inject, singleton } from "tsyringe";
import {
  UserService as CoreUserService,
  GroupService as CoreGroupService,
  GroupEntity,
  GroupCommand,
} from "@white-rabbit/business-logic";
import { Collection, EntityDTO, MikroORM } from "@mikro-orm/core";

import { type BaseClient } from "openid-client";
import { IGroupService } from "../proto/group.server";
import { Command, Group } from "../proto/group";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import AbstractService from "./abstract-service";
import { KEY_OIDC_CLIENT } from "./types";

@singleton()
export default class GroupService
  extends AbstractService<
    GroupEntity,
    GroupCommand,
    CoreGroupService,
    Group,
    Command
  >
  implements IGroupService
{
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(KEY_OIDC_CLIENT) oidcClient: BaseClient,
    @inject(CoreUserService)
    userService: CoreUserService,
    @inject(CoreGroupService)
    groupService: CoreGroupService
  ) {
    super(orm, oidcClient, userService, groupService);
  }

  override getCommand({ command }: Command): GroupCommand {
    switch (command.oneofKind) {
      case "create":
        return {
          ...command.create,
          type: "CreateGroupCommand",
        };
      case "update":
        return {
          ...command.update,
          type: "UpdateGroupCommand",
          admins: command.update.admins?.items,
          members: command.update.members?.items,
        };
      case "delete":
        return {
          type: "DeleteGroupCommand",
          targetId: command.delete.targetId,
        };
      default:
        throw new Error(`No such command`);
    }
  }

  override getModel(entity: EntityDTO<GroupEntity> | GroupEntity): Group {
    return {
      ...entity,
      createdAt: Timestamp.fromDate(entity.createdAt),
      updatedAt: Timestamp.fromDate(entity.updatedAt),
      admins: (entity.admins instanceof Collection
        ? entity.admins.getItems()
        : entity.admins
      ).map((e) => e.id),
      members: (entity.members instanceof Collection
        ? entity.members.getItems()
        : entity.members
      ).map((e) => e.id),
    };
  }
}
