import { inject, singleton } from "tsyringe";
import {
  AuthUser,
  GroupEntity,
  GroupService,
  JournalService,
  RoleValue,
  UserEntity,
  UserService,
} from "@white-rabbit/business-logic";
import { EntityDTO, MikroORM } from "@mikro-orm/core";

@singleton()
export default class AccessItemResolver {
  constructor(
    @inject(MikroORM) private readonly orm: MikroORM,
    @inject(UserService) private readonly userService: UserService,
    @inject(GroupService) private readonly groupService: GroupService,
    @inject(JournalService) private readonly journalService: JournalService
  ) {}

  __resolveType(parent: { user?: string; group?: string }): string | null {
    if (parent.user != null) {
      return "AccessItemUser";
    }

    if (parent.group != null) {
      return "AccessItemGroup";
    }
    return null;
  }

  async user(
    parent: { user?: string; group?: string },
    _args: unknown,
    context: { authUser: AuthUser }
  ): Promise<EntityDTO<UserEntity> | null> {
    if (context.authUser == null) {
      const user = (await this.orm.em
        .fork()
        .findOne(UserEntity, { role: RoleValue.ADMIN })) as UserEntity;
      context.authUser = {
        authId: user.authIds[0],
        user: user,
        scopes: [
          this.userService.readScope,
          this.groupService.readScope,
          this.journalService.readScope,
        ],
      };
    }

    if (parent.user == null) {
      return null;
    }

    const entity = await this.userService.findOne({
      query: {
        id: parent.user,
      },
      authUser: context.authUser,
    });
    return entity == null ? null : entity.toObject();
  }

  async group(
    parent: { user?: string; group?: string },
    _args: unknown,
    context: { authUser: AuthUser }
  ): Promise<EntityDTO<GroupEntity> | null> {
    if (context.authUser == null) {
      const user = (await this.orm.em
        .fork()
        .findOne(UserEntity, { role: RoleValue.ADMIN })) as UserEntity;
      context.authUser = {
        authId: user.authIds[0],
        user: user,
        scopes: [
          this.userService.readScope,
          this.groupService.readScope,
          this.journalService.readScope,
        ],
      };
    }

    if (parent.group == null) {
      return null;
    }

    const entity = await this.groupService.findOne({
      query: {
        id: parent.group,
      },
      authUser: context.authUser,
    });
    return entity == null ? null : entity.toObject();
  }
}
