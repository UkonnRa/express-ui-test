import { AuthUser, Service } from "../shared";
import GroupEntity from "./group.entity";
import GroupCommand from "./group.command";
import { singleton } from "tsyringe";
import { MikroORM } from "@mikro-orm/core";

export const GROUP_READ_SCOPE =
  "urn:alices-wonderland:white-rabbit:groups:read";
export const GROUP_WRITE_SCOPE =
  "urn:alices-wonderland:white-rabbit:groups:write";

@singleton()
export default class GroupService extends Service<GroupEntity, GroupCommand> {
  constructor(orm: MikroORM) {
    super(orm, GROUP_READ_SCOPE, GROUP_WRITE_SCOPE, GroupEntity);
  }

  async handle(): Promise<GroupEntity | null> {
    return null;
  }

  async handleAll(): Promise<Array<GroupEntity | null>> {
    return [];
  }

  async handleAdditionalQueries(): Promise<GroupEntity[]> {
    return [];
  }

  async isReadable(entity: GroupEntity, authUser?: AuthUser): Promise<boolean> {
    if (!this.isScopeIncluded(this.readScope, entity, authUser)) {
      return false;
    }

    if (!entity.admins.isInitialized()) {
      await entity.admins.init();
    }

    if (!entity.members.isInitialized()) {
      await entity.members.init();
    }

    return (
      authUser?.user != null &&
      (entity.admins.contains(authUser.user) ||
        entity.members.contains(authUser.user))
    );
  }

  async isWriteable(
    entity: GroupEntity,
    authUser?: AuthUser
  ): Promise<boolean> {
    if (!this.isScopeIncluded(this.writeScope, entity, authUser)) {
      return false;
    }

    if (!entity.admins.isInitialized()) {
      await entity.admins.init();
    }

    return authUser?.user != null && entity.admins.contains(authUser.user);
  }
}
