import { inject, singleton } from "tsyringe";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import {
  AccessItemInput,
  AccessItemQuery,
  AccessItemTypeValue,
  AccessItemValue,
  CONTAINING_USER_OPERATOR,
  FULL_TEXT_OPERATOR,
} from "@white-rabbit/types";
import isEmpty from "lodash/isEmpty";
import { UserEntity, UserService } from "../user";
import { GroupEntity, GroupService } from "../group";
import { AuthUser, FindAllInput } from "../shared";

@singleton()
export default class AccessItemService {
  constructor(
    @inject(MikroORM) private readonly orm: MikroORM,
    @inject(UserService) private readonly userService: UserService,
    @inject(GroupService) private readonly groupService: GroupService
  ) {}

  async loadAll(
    authUser: AuthUser,
    accessItems: AccessItemInput[],
    em: EntityManager
  ): Promise<Array<UserEntity | GroupEntity>> {
    const getEntities = async (
      itemType: AccessItemTypeValue
    ): Promise<Array<UserEntity | GroupEntity>> => {
      const ids = accessItems
        .filter(({ type }) => type === itemType)
        .map(({ id }) => id);
      const service =
        itemType === AccessItemTypeValue.USER
          ? this.userService
          : this.groupService;
      return isEmpty(ids)
        ? []
        : service.findAll(
            {
              authUser,
              query: {
                id: ids,
              },
            },
            em
          );
    };

    const result = await Promise.all([
      getEntities(AccessItemTypeValue.USER),
      getEntities(AccessItemTypeValue.GROUP),
    ]);
    return result.flatMap((items) => items);
  }

  async findAll(
    { authUser, query, size, sort }: FindAllInput<AccessItemQuery>,
    em?: EntityManager
  ): Promise<AccessItemValue[]> {
    this.userService.checkPermission(authUser);
    this.groupService.checkPermission(authUser);

    if (query == null) {
      return [];
    }

    const emInst = em ?? this.orm.em.fork();
    const users: UserEntity[] = [];
    const groups: GroupEntity[] = [];

    // type === null | USER: Search users
    if (query.type !== AccessItemTypeValue.GROUP) {
      users.push(
        ...(await this.userService.findAll(
          {
            authUser,
            query: {
              name:
                query[FULL_TEXT_OPERATOR] != null
                  ? { [FULL_TEXT_OPERATOR]: query[FULL_TEXT_OPERATOR] }
                  : undefined,
              id: query[CONTAINING_USER_OPERATOR],
            },
            size,
            sort,
          },
          emInst
        ))
      );
    }

    // type === null | GROUP: Search groups
    if (query.type !== AccessItemTypeValue.USER) {
      groups.push(
        ...(await this.groupService.findAll(
          {
            authUser,
            query: {
              [FULL_TEXT_OPERATOR]: query[FULL_TEXT_OPERATOR],
              [CONTAINING_USER_OPERATOR]: query[CONTAINING_USER_OPERATOR],
            },
            size,
            sort,
          },
          emInst
        ))
      );
    }

    return [
      ...users.map((item) => ({
        id: item.id,
        type: AccessItemTypeValue.USER,
        name: item.name,
      })),
      ...groups.map((item) => ({
        id: item.id,
        type: AccessItemTypeValue.GROUP,
        name: item.name,
      })),
    ]
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, size);
  }
}
