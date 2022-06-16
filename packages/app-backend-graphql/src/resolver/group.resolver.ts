import { inject, singleton } from "tsyringe";
import {
  AuthUser,
  GroupEntity,
  UserEntity,
  UserService,
} from "@white-rabbit/business-logic";
import { EntityDTO } from "@mikro-orm/core";
import { Connection, FindPage } from "../model";
import { createFindPage, createConnection } from "./utils";

@singleton()
export default class GroupResolver {
  constructor(@inject(UserService) private readonly userService: UserService) {}

  async admins(
    parent: EntityDTO<GroupEntity>,
    args: FindPage,
    context: { authUser: AuthUser }
  ): Promise<Connection<UserEntity>> {
    const input = createFindPage<UserEntity>(args);
    if (input.query == null) {
      input.query = {};
    }
    input.query.adminInGroups = parent.id;
    const page = await this.userService.findPage({
      ...input,
      authUser: context.authUser,
    });
    return createConnection(page);
  }

  async members(
    parent: EntityDTO<GroupEntity>,
    args: FindPage,
    context: { authUser: AuthUser }
  ): Promise<Connection<UserEntity>> {
    const input = createFindPage<UserEntity>(args);
    if (input.query == null) {
      input.query = {};
    }
    input.query.memberInGroups = parent.id;
    const page = await this.userService.findPage({
      ...input,
      authUser: context.authUser,
    });
    return createConnection(page);
  }
}
