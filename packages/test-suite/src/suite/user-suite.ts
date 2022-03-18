import {
  Role,
  TYPE_USER,
  User,
  UserCommand,
  UserCommandCreate,
  UserQuery,
  UserValue,
} from "@white-rabbit/business-logic/src/domains/user";
import {
  GroupRepository,
  GroupService,
  UserRepository,
  UserService,
} from "@white-rabbit/business-logic/src/domains";
import { PageResult } from "@white-rabbit/business-logic/src/shared/abstract-repository";
import { inject, singleton } from "tsyringe";
import {
  ReadTask,
  ReadTaskPageSuccess,
  ReadTaskSingleSuccess,
  WriteTaskSuccess,
} from "../task";
import { AbstractSuite } from "./abstract-suite";

@singleton()
export class UserSuite extends AbstractSuite<
  User,
  UserRepository,
  UserService,
  UserValue,
  UserQuery,
  UserCommand
> {
  constructor(
    @inject("UserRepository") override readonly userRepository: UserRepository,
    override readonly userService: UserService,
    @inject("GroupRepository")
    override readonly groupRepository: GroupRepository,
    override readonly groupService: GroupService
  ) {
    super(
      TYPE_USER,
      userRepository,
      userService,
      userRepository,
      userService,
      groupRepository,
      groupService
    );
  }

  override readTasks: Array<ReadTask<UserQuery, UserValue>> = [
    new ReadTaskSingleSuccess(
      "find self by ID",
      () => this.getAuthUser(0),
      () => this.users[0].id,
      (user: UserValue) => expect(user.name).toBe(this.users[0].name)
    ),
    new ReadTaskPageSuccess(
      "find all by fullText",
      () => this.getAuthUser(0),
      () => ({
        sort: [{ field: "name", order: "ASC" }],
        pagination: { size: 1, startFrom: "FIRST" },
        query: { type: "UserQueryFullText", keyword: { value: "Owner" } },
      }),
      (page: PageResult<UserValue>) => {
        expect(page.pageInfo).toEqual(
          expect.objectContaining({
            hasNextPage: true,
            hasPreviousPage: false,
          })
        );
        expect(page.pageItems[0].data).toEqual(
          expect.objectContaining({
            id: this.users[0].id,
            name: this.users[0].name,
            role: this.users[0].role,
          })
        );
      }
    ),
  ];

  override writeTasks = [
    new WriteTaskSuccess<UserCommandCreate, User>(
      "create when login",
      () =>
        this.getAuthUser({
          provider: "New Provider",
          id: "Provider ID",
        }),
      () => ({ type: "UserCommandCreate", name: "New Name", role: Role.USER }),
      (result) => {
        if (result != null) {
          expect({
            name: result.name,
            role: result.role,
            authIds: result.authIds,
          }).toStrictEqual({
            name: "New Name",
            role: Role.USER,
            authIds: new Map([["New Provider", "Provider ID"]]),
          });
        } else {
          fail("No user created");
        }
      }
    ),
  ];
}
