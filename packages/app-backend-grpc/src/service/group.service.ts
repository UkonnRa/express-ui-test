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
import { FindAllRequest, Order, RelationshipRequest } from "../proto/shared";
import { StringValue } from "../proto/google/protobuf/wrappers";
import { DeepPartial, UserPage } from "../proto/user";
import {
  Group,
  GroupPage,
  GroupResponse,
  GroupServiceServiceImplementation,
} from "../proto/group";
import UserService from "./user.service";

@singleton()
export default class GroupService implements GroupServiceServiceImplementation {
  constructor(
    @inject(MikroORM) private readonly orm: MikroORM,
    @inject(CoreUserService) private readonly userService: CoreUserService,
    @inject(CoreGroupService) private readonly groupService: CoreGroupService,
    @inject(UserService) private readonly grpcUserService: UserService
  ) {}

  async admins({
    id,
    input,
  }: RelationshipRequest): Promise<DeepPartial<UserPage>> {
    const query = input?.query != null ? JSON.parse(input.query) : {};
    return this.grpcUserService.findAll({
      query: JSON.stringify({
        ...query,
        adminInGroups: id,
      }),
      pagination: input?.pagination,
      sort: input?.sort ?? [],
    });
  }

  async findAll(request: FindAllRequest): Promise<DeepPartial<GroupPage>> {
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
    const page = await this.groupService.findAll({
      query,
      authUser,
      pagination: request.pagination ?? { size: 5 },
      sort: request.sort.map(({ field, order }) => ({
        field,
        order: order === Order.ASC ? CoreOrder.ASC : CoreOrder.DESC,
      })),
    });

    return GroupPage.fromJSON(page);
  }

  async findOne(request: StringValue): Promise<DeepPartial<GroupResponse>> {
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

    return { group: entity != null ? Group.fromJSON(entity) : undefined };
  }

  async members({
    id,
    input,
  }: RelationshipRequest): Promise<DeepPartial<UserPage>> {
    const query = input?.query != null ? JSON.parse(input.query) : {};
    return this.grpcUserService.findAll({
      query: JSON.stringify({
        ...query,
        memberInGroups: id,
      }),
      pagination: input?.pagination,
      sort: input?.sort ?? [],
    });
  }
}
