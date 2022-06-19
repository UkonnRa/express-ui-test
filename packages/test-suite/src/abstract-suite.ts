import {
  AbstractEntity,
  AuthUser,
  Command,
  CommandInput,
  CommandsInput,
  FindPageInput,
  FindOneInput,
  UserEntity,
  WriteService,
  ALL_SCOPES,
} from "@white-rabbit/business-logic";
import { MikroORM } from "@mikro-orm/core";
import { Task, FindPageTask } from "./task";
import AbstractTask, { AuthUserInput } from "./task/abstract-task";
import AbstractExceptionTask from "./task/abstract-exception-task";

export default abstract class AbstractSuite<
  E extends AbstractEntity<E>,
  C extends Command,
  S extends WriteService<E, C>
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
      userValue = await em.findOneOrFail(UserEntity, user, {});
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
      scopes: scopes ?? ALL_SCOPES,
    };
  }

  private async runFindPageTask(
    { checker, expectNextPage, expectPreviousPage }: FindPageTask<E>,
    input: FindPageInput<E>
  ): Promise<void> {
    const em = this.orm.em.fork();
    const page = await this.service.findPage(input);
    await checker?.(
      {
        input,
        item: page.items,
      },
      em
    );

    if (expectNextPage === true) {
      expect(page.pageInfo.hasNextPage).toBeTruthy();
      expect(page.items.length).toBe(input.pagination.size);
      const nextPage = await this.service.findPage({
        ...input,
        pagination: {
          ...input.pagination,
          before: undefined,
          after: page.pageInfo.endCursor,
        },
      });
      await checker?.(
        {
          input,
          item: [...page.items, ...nextPage.items],
        },
        em
      );
      expect(nextPage.pageInfo.hasPreviousPage).toBeTruthy();

      const nextPagePrevious = await this.service.findPage({
        ...input,
        pagination: {
          ...input.pagination,
          after: undefined,
          before: nextPage.pageInfo.startCursor,
        },
      });
      expect(nextPagePrevious).toStrictEqual(page);
    } else if (expectNextPage === false) {
      expect(page.pageInfo.hasNextPage).toBe(false);
      if (page.pageInfo.endCursor != null) {
        const nextPage = await this.service.findPage({
          ...input,
          pagination: {
            ...input.pagination,
            before: undefined,
            after: page.pageInfo.endCursor,
          },
        });
        expect(nextPage.items.length).toBe(0);
      }
    }

    if (expectPreviousPage === true) {
      expect(page.pageInfo.hasPreviousPage).toBe(true);
      const previousPage = await this.service.findPage({
        ...input,
        pagination: {
          ...input.pagination,
          after: undefined,
          before: page.pageInfo.startCursor,
        },
      });
      await checker?.(
        {
          input,
          item: [...previousPage.items, ...page.items],
        },
        em
      );
      expect(previousPage.pageInfo.hasNextPage).toBeTruthy();

      const previousPageNext = await this.service.findPage({
        ...input,
        pagination: {
          ...input.pagination,
          before: undefined,
          after: previousPage.pageInfo.endCursor,
        },
      });
      expect(previousPageNext).toStrictEqual(page);
    } else if (expectPreviousPage === false) {
      expect(page.pageInfo.hasPreviousPage).toBe(false);
      if (page.pageInfo.startCursor != null) {
        const previousPage = await this.service.findPage({
          ...input,
          pagination: {
            ...input.pagination,
            after: undefined,
            before: page.pageInfo.startCursor,
          },
        });
        expect(previousPage.items.length).toBe(0);
      }
    }
  }

  private async runExceptionTask<I>(
    { expected, checker }: AbstractExceptionTask<E, I, any>,
    input: I,
    func: () => Promise<unknown>
  ): Promise<void> {
    const expectedValue =
      expected instanceof Function ? await expected(input) : expected;
    await expect(async () => func()).rejects.toThrowError(
      expect.objectContaining(expectedValue)
    );
    await checker?.(
      {
        input,
        item: [],
      },
      this.orm.em.fork()
    );
  }

  private async doRunTask<I, R>(
    { checker }: AbstractTask<E, any, R>,
    input: I,
    func: () => Promise<R>
  ): Promise<void> {
    await checker?.(
      {
        input,
        item: await func(),
      },
      this.orm.em.fork()
    );
  }

  async runTask(task: Task<E, C>): Promise<void> {
    const em = this.orm.em.fork();
    let inputResult: typeof task.input;

    if (task.input instanceof Function) {
      inputResult = await task.input(em);
    } else {
      inputResult = task.input;
    }

    const inputValue = {
      ...inputResult,
      authUser: await this.getAuthUser(inputResult.authUser),
    };

    switch (task.type) {
      case "FindPageTask":
        await this.runFindPageTask(task, inputValue as FindPageInput<E>);
        break;
      case "FindPageExceptionTask":
        await this.runExceptionTask(
          task,
          inputValue as FindPageInput<E>,
          async () => this.service.findPage(inputValue as FindPageInput<E>)
        );
        break;
      case "FindOneTask":
        await this.doRunTask(task, inputValue as FindOneInput<E>, async () =>
          this.service.findOne(inputValue as FindOneInput<E>)
        );
        break;
      case "FindOneExceptionTask":
        await this.runExceptionTask(
          task,
          inputValue as FindOneInput<E>,
          async () => this.service.findOne(inputValue as FindOneInput<E>)
        );
        break;
      case "HandleCommandTask":
        await this.doRunTask(task, inputValue as CommandInput<C>, async () =>
          this.service.handle(inputValue as CommandInput<C>)
        );
        break;
      case "HandleCommandExceptionTask":
        await this.runExceptionTask(
          task,
          inputValue as CommandInput<C>,
          async () => this.service.handle(inputValue as CommandInput<C>)
        );
        break;
      case "HandleCommandsTask":
        await this.doRunTask(task, inputValue as CommandsInput<C>, async () =>
          this.service.handleAll(inputValue as CommandsInput<C>)
        );
        break;
      case "HandleCommandsExceptionTask":
        await this.runExceptionTask(
          task,
          inputValue as CommandsInput<C>,
          async () => this.service.handleAll(inputValue as CommandsInput<C>)
        );
        break;
    }
  }
}
