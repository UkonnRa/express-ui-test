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
import { UserEntity, UserService } from "../user";
import { GroupEntity, GroupService } from "../group";
import FindInput from "../shared/find.input";
import { AuthUser } from "../shared";

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
    const users = await this.userService.findAll(
      {
        authUser,
        query: {
          id: accessItems
            .filter(({ type }) => type === AccessItemTypeValue.USER)
            .map(({ id }) => id),
        },
      },
      em
    );

    const groups = await this.groupService.findAll(
      {
        authUser,
        query: {
          id: accessItems
            .filter(({ type }) => type === AccessItemTypeValue.GROUP)
            .map(({ id }) => id),
        },
      },
      em
    );

    return [...users, ...groups];
  }

  async findAll(
    { authUser, query }: FindInput<AccessItemQuery>,
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
    ];
  }
}
