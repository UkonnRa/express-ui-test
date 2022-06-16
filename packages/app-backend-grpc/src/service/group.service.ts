import { inject, singleton } from "tsyringe";
import {
  Order as CoreOrder,
  Query,
  RoleValue,
  UserEntity,
  UserService as CoreUserService,
  GroupService as CoreGroupService,
  GroupEntity,
} from "@white-rabbit/business-logic";
import { MikroORM } from "@mikro-orm/core";
import { RpcInputStream } from "@protobuf-ts/runtime-rpc";

import { IGroupService } from "../proto/app.server";
import { StringValue } from "../proto/google/protobuf/wrappers";
import {
  FindPageRequest,
  Group,
  GroupPage,
  GroupResponse,
  Order,
  User,
} from "../proto/app";

@singleton()
export default class GroupService implements IGroupService {
  constructor(
    @inject(MikroORM) private readonly orm: MikroORM,
    @inject(CoreUserService) private readonly userService: CoreUserService,
    @inject(CoreGroupService) private readonly groupService: CoreGroupService
  ) {}

  async admins(
    request: StringValue,
    responses: RpcInputStream<User>
  ): Promise<void> {
    const user = (await this.orm.em
      .fork()
      .findOne(UserEntity, { role: RoleValue.ADMIN })) as UserEntity;
    const authUser = {
      authId: user.authIds[0],
      user: user,
      scopes: [this.userService.readScope, this.groupService.readScope],
    };

    const entity = await this.groupService.findOne({
      query: { id: request.value },
      authUser,
    });

    if (entity == null) {
      await responses.complete();
      return;
    }

    for (const item of await entity.admins.loadItems()) {
      await responses.send(User.fromJsonString(JSON.stringify(item)));
    }
    await responses.complete();
  }

  async findOne(request: StringValue): Promise<GroupResponse> {
    const query: Query<GroupEntity> = JSON.parse(request.value);
    const user = (await this.orm.em
      .fork()
      .findOne(UserEntity, { role: RoleValue.ADMIN })) as UserEntity;
    const authUser = {
      authId: user.authIds[0],
      user: user,
      scopes: [this.userService.readScope, this.groupService.readScope],
    };

    const entity = await this.groupService.findOne({
      query,
      authUser,
    });

    return {
      group:
        entity != null
          ? Group.fromJsonString(JSON.stringify(entity))
          : undefined,
    };
  }

  async findPage(request: FindPageRequest): Promise<GroupPage> {
    const query: Query<GroupEntity> =
      request.query != null ? JSON.parse(request.query) : {};
    const user = (await this.orm.em
      .fork()
      .findOne(UserEntity, { role: RoleValue.ADMIN })) as UserEntity;
    const authUser = {
      authId: user.authIds[0],
      user: user,
      scopes: [this.userService.readScope, this.groupService.readScope],
    };
    const page = await this.groupService.findPage({
      query,
      authUser,
      pagination: request.pagination ?? { size: 5 },
      sort: request.sort.map(({ field, order }) => ({
        field,
        order: order === Order.ASC ? CoreOrder.ASC : CoreOrder.DESC,
      })),
    });

    return GroupPage.fromJsonString(JSON.stringify(page));
  }

  async members(
    request: StringValue,
    responses: RpcInputStream<User>
  ): Promise<void> {
    const user = (await this.orm.em
      .fork()
      .findOne(UserEntity, { role: RoleValue.ADMIN })) as UserEntity;
    const authUser = {
      authId: user.authIds[0],
      user: user,
      scopes: [this.userService.readScope, this.groupService.readScope],
    };

    const entity = await this.groupService.findOne({
      query: { id: request.value },
      authUser,
    });

    if (entity == null) {
      await responses.complete();
      return;
    }

    for (const item of await entity.members.loadItems()) {
      await responses.send(User.fromJsonString(JSON.stringify(item)));
    }
    await responses.complete();
  }
}
