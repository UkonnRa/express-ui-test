import {
  AbstractEntity,
  AuthUser,
  Command,
  CommandInput,
  CommandsInput,
  FindAllInput,
  FindOneInput,
  Service,
  UserEntity,
} from "@white-rabbit/business-logic";
import {
  Task,
  FindAllTask,
  FindAllExceptionTask,
  FindOneTask,
  FindOneExceptionTask,
  HandleCommandTask,
  HandleCommandExceptionTask,
  HandleCommandsTask,
  HandleCommandsExceptionTask,
} from "./task";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import { AuthUserInput } from "./task/abstract-task";

export default abstract class AbstractSuite<
  E extends AbstractEntity<E>,
  C extends Command,
  S extends Service<E, C>
> {
  readonly tasks: Array<Task<E, C>>;

  protected constructor(
    private readonly orm: MikroORM,
    private readonly service: S
  ) {}

  private async getAuthUser({
    user,
    authId,
    scopes,
  }: AuthUserInput): Promise<AuthUser> {
    if (user == null && authId == null) {
      throw new Error(
        "Invalid test case: Field[user] and Field[authId] should not both null in AuthUserInput"
      );
    }

    let userValue: UserEntity | undefined;
    if (user != null) {
      const em = this.orm.em.fork();
      userValue = await em.findOneOrFail(UserEntity, user, {
        filters: { excludeDeleted: user.deletedAt == null },
      });
    }

    let authIdValue = authId;
    if (authIdValue == null) {
      if (userValue != null) {
        authIdValue = userValue.authIds[0];
      } else {
        throw new Error(
          "Invalid test case: Field[user] and Field[authId] should not both null in AuthUserInput"
        );
      }
    }

    return {
      authId: authIdValue,
      user: userValue,
      scopes: scopes ?? [this.service.readScope, this.service.writeScope],
    };
  }

  private async runFindAllTask<V>(
    { checker, expectNextPage, expectPreviousPage }: FindAllTask<E, V>,
    inputValue: FindAllInput<E>
  ): Promise<void> {
    const page = await this.service.findAll(inputValue);
    checker(page.items);

    if (expectNextPage === true) {
      expect(page.pageInfo.hasNextPage).toBeTruthy();
      expect(page.items.length).toBe(inputValue.pagination.size);
      const nextPage = await this.service.findAll({
        ...inputValue,
        pagination: {
          ...inputValue.pagination,
          before: undefined,
          after: page.pageInfo.endCursor,
        },
      });
      checker([...page.items, ...nextPage.items]);
      expect(nextPage.pageInfo.hasPreviousPage).toBeTruthy();

      const nextPagePrevious = await this.service.findAll({
        ...inputValue,
        pagination: {
          ...inputValue.pagination,
          after: undefined,
          before: nextPage.pageInfo.startCursor,
        },
      });
      expect(nextPagePrevious).toStrictEqual(page);
    } else if (expectNextPage === false) {
      expect(page.pageInfo.hasNextPage).toBe(false);
      if (page.pageInfo.endCursor != null) {
        const nextPage = await this.service.findAll({
          ...inputValue,
          pagination: {
            ...inputValue.pagination,
            before: undefined,
            after: page.pageInfo.endCursor,
          },
        });
        expect(nextPage.items.length).toBe(0);
      }
    }

    if (expectPreviousPage === true) {
      expect(page.pageInfo.hasPreviousPage).toBe(true);
      const previousPage = await this.service.findAll({
        ...inputValue,
        pagination: {
          ...inputValue.pagination,
          after: undefined,
          before: page.pageInfo.startCursor,
        },
      });
      checker([...previousPage.items, ...page.items]);
      expect(previousPage.pageInfo.hasNextPage).toBeTruthy();

      const previousPageNext = await this.service.findAll({
        ...inputValue,
        pagination: {
          ...inputValue.pagination,
          before: undefined,
          after: previousPage.pageInfo.endCursor,
        },
      });
      expect(previousPageNext).toStrictEqual(page);
    } else if (expectPreviousPage === false) {
      expect(page.pageInfo.hasPreviousPage).toBe(false);
      if (page.pageInfo.startCursor != null) {
        const previousPage = await this.service.findAll({
          ...inputValue,
          pagination: {
            ...inputValue.pagination,
            after: undefined,
            before: page.pageInfo.startCursor,
          },
        });
        expect(previousPage.items.length).toBe(0);
      }
    }
  }

  private async runFindAllExceptionTask<V>(
    { expected }: FindAllExceptionTask<E, V>,
    inputValue: FindAllInput<E>
  ): Promise<void> {
    await expect(() => this.service.findAll(inputValue)).rejects.toThrowError(
      expect.objectContaining(expected)
    );
  }

  private async runFindOneTask<V>(
    { checker }: FindOneTask<E, V>,
    inputValue: FindOneInput<E>
  ): Promise<void> {
    const item = await this.service.findOne(inputValue);
    checker(item);
  }

  private async runFindOneExceptionTask<V>(
    { expected }: FindOneExceptionTask<E, V>,
    inputValue: FindOneInput<E>
  ): Promise<void> {
    await expect(() => this.service.findOne(inputValue)).rejects.toThrowError(
      expect.objectContaining(expected)
    );
  }

  private async runHandleCommandTask<CC extends C, V>(
    { checker }: HandleCommandTask<E, C, CC, V>,
    inputValue: CommandInput<CC>,
    em: EntityManager
  ): Promise<void> {
    const item = await this.service.handle(inputValue, em);
    checker({
      item,
      command: inputValue.command,
      authUser: inputValue.authUser,
    });
  }

  private async runHandleCommandExceptionTask<CC extends C, V>(
    { expected }: HandleCommandExceptionTask<C, V>,
    inputValue: CommandInput<CC>
  ): Promise<void> {
    const expectedValue =
      expected instanceof Function ? await expected(inputValue) : expected;
    await expect(() => this.service.handle(inputValue)).rejects.toThrowError(
      expect.objectContaining(expectedValue)
    );
  }

  private async runHandleCommandsTask<V>(
    { checker }: HandleCommandsTask<E, C, V>,
    inputValue: CommandsInput<C>,
    em: EntityManager
  ): Promise<void> {
    const items = await this.service.handleAll(inputValue, em);
    checker({
      items,
      commands: inputValue.commands,
      authUser: inputValue.authUser,
    });
  }

  private async runHandleCommandsExceptionTask<CC extends C, V>(
    { expected, checker }: HandleCommandsExceptionTask<E, C, V>,
    inputValue: CommandsInput<CC>
  ): Promise<void> {
    const expectedValue =
      expected instanceof Function ? await expected(inputValue) : expected;
    await expect(() => this.service.handleAll(inputValue)).rejects.toThrowError(
      expect.objectContaining(expectedValue)
    );
    await checker(
      {
        items: [],
        commands: inputValue.commands,
        authUser: inputValue.authUser,
      },
      this.orm.em.fork()
    );
  }

  async runTask<V>(task: Task<E, C, V>): Promise<void> {
    const em = this.orm.em.fork();
    const setupResult = task.setup != null ? await task.setup(em) : undefined;
    let inputResult: typeof task.input;

    if (task.input instanceof Function) {
      if (setupResult == null) {
        throw new Error("setup() cannot be null while the input is a function");
      } else {
        inputResult = await task.input(setupResult);
      }
    } else {
      inputResult = task.input;
    }

    const inputValue = {
      ...inputResult,
      authUser: await this.getAuthUser(inputResult.authUser),
    };

    switch (task.type) {
      case "FindAllTask":
        await this.runFindAllTask(task, inputValue as FindAllInput<E>);
        break;
      case "FindAllExceptionTask":
        await this.runFindAllExceptionTask(task, inputValue as FindAllInput<E>);
        break;
      case "FindOneTask":
        await this.runFindOneTask(task, inputValue as FindOneInput<E>);
        break;
      case "FindOneExceptionTask":
        await this.runFindOneExceptionTask(task, inputValue as FindOneInput<E>);
        break;
      case "HandleCommandTask":
        await this.runHandleCommandTask(
          task,
          inputValue as CommandInput<C>,
          em
        );
        break;
      case "HandleCommandExceptionTask":
        await this.runHandleCommandExceptionTask(
          task,
          inputValue as CommandInput<C>
        );
        break;
      case "HandleCommandsTask":
        await this.runHandleCommandsTask(
          task,
          inputValue as CommandsInput<C>,
          em
        );
        break;
      case "HandleCommandsExceptionTask":
        await this.runHandleCommandsExceptionTask(
          task,
          inputValue as CommandsInput<C>
        );
        break;
    }
  }
}
