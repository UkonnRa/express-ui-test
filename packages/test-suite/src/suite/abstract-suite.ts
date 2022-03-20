import {
  GroupRepository,
  GroupService,
  UserRepository,
  UserService,
} from "@white-rabbit/business-logic/src/domains";
import {
  Role,
  User,
  UserCreateOptions,
} from "@white-rabbit/business-logic/src/domains/user";
import {
  Group,
  GroupCreateOptions,
} from "@white-rabbit/business-logic/src/domains/group";
import each from "jest-each";
import AbstractService from "@white-rabbit/business-logic/src/shared/abstract-service";
import AbstractEntity from "@white-rabbit/business-logic/src/shared/abstract-entity";
import AbstractRepository from "@white-rabbit/business-logic/src/shared/abstract-repository";
import AuthUser, {
  AuthId,
} from "@white-rabbit/business-logic/src/shared/auth-user";
import { ReadTask, WriteTask } from "../task";

export abstract class AbstractSuite<
  T extends AbstractEntity<T, V, unknown>,
  R extends AbstractRepository<T, V, Q>,
  S extends AbstractService<T, R, V, Q, C>,
  V,
  Q,
  C
> {
  protected constructor(
    readonly type: string,
    readonly repository: R,
    readonly service: S,
    readonly userRepository: UserRepository,
    readonly userService: UserService,
    readonly groupRepository: GroupRepository,
    readonly groupService: GroupService
  ) {}

  protected abstract writeTasks: Array<WriteTask<C, T>>;

  protected abstract readTasks: Array<ReadTask<Q, V>>;

  protected users: User[];

  protected groups: Group[];

  private async prepareData(): Promise<void> {
    const users: User[] = [
      {
        name: "0: Owner 1",
        role: Role.OWNER,
        authIds: new Map([
          ["Provider 1", "AuthId 1-0"],
          ["Provider 2", "AuthId 2-0"],
        ]),
      },
      {
        name: "1: Owner 2",
        role: Role.OWNER,
        authIds: new Map([
          ["Provider 3", "AuthId 3-1"],
          ["Provider 2", "AuthId 2-1"],
        ]),
      },
      {
        name: "2: Admin 1",
        role: Role.ADMIN,
        authIds: new Map([
          ["Provider 1", "AuthId 1-2"],
          ["Provider 6", "AuthId 6-2"],
        ]),
      },
      {
        name: "3: Admin 2",
        role: Role.ADMIN,
        authIds: new Map([
          ["Provider 4", "AuthId 4-3"],
          ["Provider 5", "AuthId 5-3"],
        ]),
      },
      {
        name: "4: User 1",
        role: Role.USER,
        authIds: new Map([
          ["Provider 3", "AuthId 3-4"],
          ["Provider 4", "AuthId 4-4"],
        ]),
      },
      {
        name: "5: User 2",
        role: Role.USER,
        authIds: new Map([
          ["Provider 2", "AuthId 2-5"],
          ["Provider 4", "AuthId 4-5"],
        ]),
      },
      {
        name: "6: User Deleted",
        role: Role.USER,
        authIds: new Map([
          ["Provider 2", "AuthId 2-6"],
          ["Provider 4", "AuthId 4-6"],
        ]),
      },
    ].map((options: UserCreateOptions, idx) => {
      const user = new User(options);
      user.id = `user-id-${idx}`;
      return user;
    });
    users[6].deleted = true;
    await this.userRepository.saveAll(users);
    this.users = users;

    const groups: Group[] = [
      {
        name: "Group 1",
        description: "Group 1 Description",
        admins: [users[3], users[4]],
        members: [users[0], users[1]],
      },
      {
        name: "Group 2",
        description: "Group 2 Description",
        admins: [users[4], users[5]],
        members: [users[2], users[3]],
      },
    ].map((options: GroupCreateOptions, idx) => {
      const group = new Group(options);
      group.id = `group-id-${idx}`;
      return group;
    });
    await this.groupRepository.saveAll(groups);
    this.groups = groups;
  }

  protected getAuthUser(
    ident: number | AuthId,
    scopes: string[] = [this.service.readScope, this.service.writeScope]
  ): AuthUser {
    let authId: AuthId;
    let user: User | undefined;
    if (typeof ident === "number") {
      user = this.users[ident];
      const auth = [...user.authIds][0];
      authId = { provider: auth[0], id: auth[1] };
    } else {
      authId = ident;
    }

    return new AuthUser(authId, scopes, user);
  }

  start(): void {
    beforeAll(async () => {
      await this.prepareData();
    });

    each(this.readTasks).test(
      `Read task for ${this.type}: $name`,
      async (task: ReadTask<Q, V>) => {
        const authUser = task.authUserHandler();
        if (task.readType === "Single") {
          const input = task.inputHandler();
          if (task.type === "Success") {
            const result = await this.service.findValueById(authUser, input);
            task.handler({ input, authUser, result });
          } else {
            await expect(async () =>
              this.service.findValueById(authUser, input)
            ).rejects.toMatchObject(task.errorHandler({ input, authUser }));
          }
        } else {
          const input = task.inputHandler();
          if (task.type === "Success") {
            const result = await this.service.findAllValues(
              authUser,
              input.sort,
              input.pagination,
              input.query
            );
            task.handler({ input, authUser, result });
          } else {
            await expect(async () =>
              this.service.findAllValues(
                authUser,
                input.sort,
                input.pagination,
                input.query
              )
            ).rejects.toMatchObject(task.errorHandler({ input, authUser }));
          }
        }
      }
    );

    each(this.writeTasks).test(
      `Write task for ${this.type}: $name`,
      async (task: WriteTask<C, T>) => {
        await this.prepareData();
        const authUser = task.authUserHandler();
        const command = task.inputHandler();
        if (task.type === "Success") {
          const id = await this.service.handle(authUser, command);
          const result = await this.repository.findById(id);
          task.handler({ command, authUser, result });
        } else {
          await expect(async () =>
            this.service.handle(authUser, command)
          ).rejects.toMatchObject(task.errorHandler({ command, authUser }));
        }
      }
    );
  }
}
