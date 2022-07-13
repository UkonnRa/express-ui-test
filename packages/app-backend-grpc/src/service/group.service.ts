import { inject, singleton } from "tsyringe";
import {
  GroupService as CoreGroupService,
  GroupEntity,
} from "@white-rabbit/business-logic";
import { Collection, EntityDTO, MikroORM } from "@mikro-orm/core";

import { GroupCommand, GroupQuery } from "@white-rabbit/types";
import { IGroupService } from "../proto/group.server";
import { Command, Group } from "../proto/group";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import WriteService from "./write-service";

@singleton()
export default class GroupService
  extends WriteService<
    GroupEntity,
    GroupCommand,
    GroupQuery,
    CoreGroupService,
    Group,
    Command
  >
  implements IGroupService
{
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(CoreGroupService)
    groupService: CoreGroupService
  ) {
    super(orm, groupService);
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

  override async getModel(
    entity: EntityDTO<GroupEntity> | GroupEntity
  ): Promise<Group> {
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
