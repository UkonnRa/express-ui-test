import { inject, singleton } from "tsyringe";
import {
  AuthUser,
  GroupEntity,
  GroupService,
  UserEntity,
  UserService,
} from "@white-rabbit/business-logic";
import { EntityDTO, MikroORM } from "@mikro-orm/core";
import { RoleValue } from "@white-rabbit/types";

@singleton()
export default class GroupResolver {
  constructor(
    @inject(MikroORM) private readonly orm: MikroORM,
    @inject(UserService) private readonly userService: UserService,
    @inject(GroupService) private readonly groupService: GroupService
  ) {}

  async admins(
    parent: EntityDTO<GroupEntity>,
    _args: unknown,
    context: { authUser: AuthUser }
  ): Promise<Array<EntityDTO<UserEntity>>> {
    if (context.authUser == null) {
      const user = (await this.orm.em
        .fork()
        .findOne(UserEntity, { role: RoleValue.ADMIN })) as UserEntity;
      const authIdProvider = Object.keys(user.authIds)[0];
      context.authUser = {
        authId: {
          provider: authIdProvider,
          value: user.authIds[authIdProvider],
        },
        user,
        scopes: [this.userService.readScope, this.groupService.readScope],
      };
    }

    const entity = await this.groupService.findOne({
      authUser: context.authUser,
      query: { id: parent.id },
    });
    if (entity != null) {
      const items = await entity.admins.loadItems();
      return items.map((item) => item.toObject());
    }
    return [];
  }

  async members(
    parent: EntityDTO<GroupEntity>,
    _args: unknown,
    context: { authUser: AuthUser }
  ): Promise<Array<EntityDTO<UserEntity>>> {
    if (context.authUser == null) {
      const user = (await this.orm.em
        .fork()
        .findOne(UserEntity, { role: RoleValue.ADMIN })) as UserEntity;
      const authIdProvider = Object.keys(user.authIds)[0];
      context.authUser = {
        authId: {
          provider: authIdProvider,
          value: user.authIds[authIdProvider],
        },
        user,
        scopes: [this.userService.readScope, this.groupService.readScope],
      };
    }

    const entity = await this.groupService.findOne({
      authUser: context.authUser,
      query: { id: parent.id },
    });
    if (entity != null) {
      const items = await entity.members.loadItems();
      return items.map((item) => item.toObject());
    }
    return [];
  }
}
