import {
  AbstractEntity,
  AuthUser,
  Command,
  FindAllInput,
  Service,
  UserEntity,
} from "@white-rabbit/business-logic";
import { Task, FindAllTask, FindAllExceptionTask } from "./task";
import { MikroORM } from "@mikro-orm/core";
import { AuthUserInput } from "./task/abstract-task";

export default abstract class AbstractSuite<
  E extends AbstractEntity<E>,
  C extends Command,
  S extends Service<E, C>
> {
  readonly tasks: Array<Task<E>>;

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
      userValue = await em.findOneOrFail(UserEntity, user);
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

  private async runFindAllTask({
    input,
    checker,
    expectNextPage,
    expectPreviousPage,
  }: FindAllTask<E>): Promise<void> {
    const em = this.orm.em.fork();
    const inputValue: FindAllInput<E> = {
      ...input,
      authUser: await this.getAuthUser(input.authUser),
    };

    const page = await this.service.findAll(inputValue, em);
    checker(page.items);

    if (expectNextPage === true) {
      expect(page.pageInfo.hasNextPage).toBeTruthy();
      expect(page.items.length).toBe(inputValue.pagination.size);
      const nextPage = await this.service.findAll({
        ...inputValue,
        pagination: {
          ...inputValue.pagination,
          after: page.pageInfo.endCursor,
        },
      });
      checker([...page.items, ...nextPage.items]);
      expect(nextPage.pageInfo.hasPreviousPage).toBeTruthy();

      const nextPagePrevious = await this.service.findAll({
        ...inputValue,
        pagination: {
          ...inputValue.pagination,
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
          before: page.pageInfo.startCursor,
        },
      });
      checker([...previousPage.items, ...page.items]);
      expect(previousPage.pageInfo.hasNextPage).toBeTruthy();

      const previousPageNext = await this.service.findAll({
        ...inputValue,
        pagination: {
          ...inputValue.pagination,
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
            before: page.pageInfo.startCursor,
          },
        });
        expect(previousPage.items.length).toBe(0);
      }
    }
  }

  private async runFindAllExceptionTask({
    input,
    expected,
  }: FindAllExceptionTask<E>): Promise<void> {
    const em = this.orm.em.fork();
    const inputValue: FindAllInput<E> = {
      ...input,
      authUser: await this.getAuthUser(input.authUser),
    };

    await expect(() =>
      this.service.findAll(inputValue, em)
    ).rejects.toThrowError(expect.objectContaining(expected));
  }

  async runTask(task: Task<E>): Promise<void> {
    await task.setup?.();
    switch (task.type) {
      case "FindAllTask":
        await this.runFindAllTask(task);
        break;
      case "FindAllExceptionTask":
        await this.runFindAllExceptionTask(task);
        break;
    }
  }
}
