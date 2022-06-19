import { inject, singleton } from "tsyringe";
import {
  AccessItemGroupValue,
  AccessItemUserValue,
  AuthUser,
  GroupService,
  JournalEntity,
  JournalService,
  RoleValue,
  UserEntity,
  UserService,
} from "@white-rabbit/business-logic";
import { EntityDTO, MikroORM } from "@mikro-orm/core";

@singleton()
export default class JournalResolver {
  constructor(
    @inject(MikroORM) private readonly orm: MikroORM,
    @inject(UserService) private readonly userService: UserService,
    @inject(GroupService) private readonly groupService: GroupService,
    @inject(JournalService) private readonly journalService: JournalService
  ) {}

  async admins(
    parent: EntityDTO<JournalEntity>,
    _args: unknown,
    context: { authUser: AuthUser }
  ): Promise<Array<{ user?: string; group?: string }>> {
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

    const entity = await this.journalService.findOne({
      authUser: context.authUser,
      query: { id: parent.id },
    });
    if (entity != null) {
      await entity.accessItems.loadItems();
      return entity.admins.map((item) => ({
        user: item instanceof AccessItemUserValue ? item.user.id : undefined,
        group: item instanceof AccessItemGroupValue ? item.group.id : undefined,
      }));
    }
    return [];
  }

  async members(
    parent: EntityDTO<JournalEntity>,
    _args: unknown,
    context: { authUser: AuthUser }
  ): Promise<Array<{ user?: string; group?: string }>> {
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

    const entity = await this.journalService.findOne({
      authUser: context.authUser,
      query: { id: parent.id },
    });
    if (entity != null) {
      await entity.accessItems.loadItems();
      return entity.members.map((item) => ({
        user: item instanceof AccessItemUserValue ? item.user.id : undefined,
        group: item instanceof AccessItemGroupValue ? item.group.id : undefined,
      }));
    }
    return [];
  }
}
