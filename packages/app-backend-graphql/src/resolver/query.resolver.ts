import { inject, singleton } from "tsyringe";
import {
  AuthUser,
  GroupEntity,
  GroupService,
  Query,
  RoleValue,
  UserEntity,
  UserService,
} from "@white-rabbit/business-logic";
import { EntityDTO, MikroORM } from "@mikro-orm/core";
import { Connection, FindPage } from "../model";
import { createFindPage, createConnection } from "./utils";

@singleton()
export default class QueryResolver {
  constructor(
    @inject(MikroORM) private readonly orm: MikroORM,
    @inject(UserService) private readonly userService: UserService,
    @inject(GroupService) private readonly groupService: GroupService
  ) {}

  async user(
    _: any,
    args: { query: string },
    context: { authUser: AuthUser }
  ): Promise<EntityDTO<UserEntity> | null> {
    const query: Query<UserEntity> = JSON.parse(args.query);
    const entity = await this.userService.findOne({
      query,
      authUser: context.authUser ?? {
        scopes: [this.userService.readScope, this.groupService.readScope],
      },
    });
    return entity == null ? null : entity.toObject();
  }

  async users(
    _: any,
    args: FindPage,
    context: { authUser: AuthUser }
  ): Promise<Connection<UserEntity>> {
    const input = createFindPage<UserEntity>(args);
    const page = await this.userService.findPage({
      ...input,
      authUser: context.authUser ?? {
        scopes: [this.userService.readScope, this.groupService.readScope],
      },
    });
    return createConnection(page);
  }

  async group(
    _: any,
    args: { query: string },
    context: { authUser: AuthUser }
  ): Promise<EntityDTO<GroupEntity> | null> {
    const query: Query<GroupEntity> = JSON.parse(args.query);
    const entity = await this.groupService.findOne({
      query,
      authUser: context.authUser ?? {
        scopes: [this.userService.readScope, this.groupService.readScope],
      },
    });
    return entity == null ? null : entity.toObject();
  }

  async groups(
    _: any,
    args: FindPage,
    context: { authUser?: AuthUser }
  ): Promise<Connection<GroupEntity>> {
    const input = createFindPage<GroupEntity>(args);
    if (context.authUser == null) {
      const user = (await this.orm.em
        .fork()
        .findOne(UserEntity, { role: RoleValue.ADMIN })) as UserEntity;
      context.authUser = {
        authId: user.authIds[0],
        user: user,
        scopes: [this.userService.readScope, this.groupService.readScope],
      };
    }
    const page = await this.groupService.findPage({
      ...input,
      authUser: context.authUser,
    });
    return createConnection(page);
  }
}
