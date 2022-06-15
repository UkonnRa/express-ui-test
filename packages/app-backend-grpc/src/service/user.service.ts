import { inject, singleton } from "tsyringe";
import {
  Order as CoreOrder,
  Query,
  RoleValue,
  UserEntity,
  UserService as CoreUserService,
} from "@white-rabbit/business-logic";
import { MikroORM } from "@mikro-orm/core";
import { FindAllRequest, Order } from "../proto/shared";
import { StringValue } from "../proto/google/protobuf/wrappers";
import {
  DeepPartial,
  User,
  UserPage,
  UserResponse,
  UserServiceServiceImplementation,
} from "../proto/user";

@singleton()
export default class UserService implements UserServiceServiceImplementation {
  constructor(
    @inject(MikroORM) private readonly orm: MikroORM,
    @inject(CoreUserService) private readonly userService: CoreUserService
  ) {}

  async findAll(request: FindAllRequest): Promise<DeepPartial<UserPage>> {
    const query: Query<UserEntity> =
      request.query != null ? JSON.parse(request.query) : {};
    const user = (await this.orm.em
      .fork()
      .findOne(UserEntity, { role: RoleValue.ADMIN })) as UserEntity;
    const authUser = {
      authId: user.authIds[0],
      user: user,
      scopes: [this.userService.readScope],
    };
    const page = await this.userService.findAll({
      query,
      authUser,
      pagination: request.pagination ?? { size: 5 },
      sort: request.sort.map(({ field, order }) => ({
        field,
        order: order === Order.ASC ? CoreOrder.ASC : CoreOrder.DESC,
      })),
    });

    return UserPage.fromJSON(page);
  }

  async findOne(request: StringValue): Promise<DeepPartial<UserResponse>> {
    const query: Query<UserEntity> = JSON.parse(request.value);
    const user = (await this.orm.em
      .fork()
      .findOne(UserEntity, { role: RoleValue.ADMIN })) as UserEntity;
    const authUser = {
      authId: user.authIds[0],
      user: user,
      scopes: [this.userService.readScope],
    };

    const entity = await this.userService.findOne({
      query,
      authUser,
    });

    return { user: entity != null ? User.fromJSON(entity) : undefined };
  }
}
