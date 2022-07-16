import { inject, singleton } from "tsyringe";
import {
  GroupService as CoreGroupService,
  GroupEntity,
  AuthUser,
} from "@white-rabbit/business-logic";
import {
  Collection,
  EntityDTO,
  EntityManager,
  MikroORM,
} from "@mikro-orm/core";

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
    entity: EntityDTO<GroupEntity> | GroupEntity,
    em: EntityManager,
    authUser: AuthUser
  ): Promise<Group> {
    const hydrated = await em.findOneOrFail(GroupEntity, { id: entity.id });

    let isWriteable = false;
    try {
      await this.service.checkWriteable(hydrated, authUser);
      isWriteable = true;
    } catch (e) {}

    return {
      ...entity,
      createdAt: Timestamp.fromDate(entity.createdAt),
      updatedAt: Timestamp.fromDate(entity.updatedAt),
      admins: (entity.admins instanceof Collection
        ? entity.admins.getItems()
        : entity.admins
      ).map((e) => ({ id: e.id, name: e.name })),
      members: (entity.members instanceof Collection
        ? entity.members.getItems()
        : entity.members
      ).map((e) => ({ id: e.id, name: e.name })),
      isWriteable,
    };
  }
}
