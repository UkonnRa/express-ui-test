import "reflect-metadata";
import {
  Account,
  AccountType,
  Strategy,
} from "@white-rabbit/business-logic/src/domains/account";
import { container } from "tsyringe";
import {
  AccessListCreateOptions,
  Journal,
} from "@white-rabbit/business-logic/src/domains/journal";
import AuthUser from "@white-rabbit/business-logic/src/shared/auth-user";
import { Role, User } from "@white-rabbit/business-logic/src/domains/user";
import { initMemoryRepositories } from "@white-rabbit/repository-memory";
import {
  AccountRepository,
  JournalRepository,
  UserRepository,
  AccountService,
} from "@white-rabbit/business-logic/src/domains";

describe("Accounts", () => {
  void initMemoryRepositories();
  const accountRepository: AccountRepository =
    container.resolve("AccountRepository");
  const journalRepository: JournalRepository =
    container.resolve("JournalRepository");
  const userRepository: UserRepository = container.resolve("UserRepository");
  const accountService = container.resolve(AccountService);

  const admin = new User({
    name: "User Admin",
    role: Role.ADMIN,
    authIds: new Map([["Provider", "oauthId"]]),
  });
  const accessList: AccessListCreateOptions = { type: "USERS", users: [admin] };
  const journal = new Journal({
    name: "Journal Name",
    description: "Journal Description",
    admins: accessList,
    members: accessList,
  });
  const accounts = [
    new Account({
      name: ["Account Type 1", "Sub Type 1"],
      description: "Account 1-1 Description",
      journal,
      accountType: AccountType.ASSET,
      unit: "USD",
      strategy: Strategy.AVERAGE,
    }),
    new Account({
      name: ["Account Type 1", "Sub Type 2"],
      description: "Account 1-2 Description",
      journal,
      accountType: AccountType.EQUITY,
      unit: "RMB",
      strategy: Strategy.FIFO,
    }),
    new Account({
      name: ["Account Type 2", "Sub Type 1"],
      description: "Account 2-1 Description",
      journal,
      accountType: AccountType.ASSET,
      unit: "USD",
      strategy: Strategy.AVERAGE,
    }),
  ];
  void Promise.all([
    userRepository.save(admin),
    journalRepository.save(journal),
    ...accounts.map(async (a) => accountRepository.save(a)),
  ]);

  const authUser = new AuthUser(
    { provider: "Provider", id: "oauthId" },
    ["accounts:read", "accounts:write", "journals:read", "journals:write"],
    admin
  );

  it("can query", async () => {
    {
      const result = await accountService.findAllValues(
        authUser,
        [{ field: "name", order: "ASC" }],
        {
          size: 10,
          startFrom: "FIRST",
        }
      );
      expect(result.pageItems.map(({ data }) => data)).toStrictEqual(
        accounts.map((v) => v.toValue())
      );
    }
    {
      const result = await accountService.findAllValues(
        authUser,
        [{ field: "name", order: "ASC" }],
        {
          size: 10,
          startFrom: "FIRST",
        },
        {
          type: "AccountQueryFullText",
          keyword: { fields: ["name"], value: "Type 2" },
        }
      );
      expect(result.pageItems.map(({ data }) => data)).toStrictEqual(
        [accounts[1], accounts[2]].map((v) => v?.toValue())
      );
    }
    {
      const result = await accountService.findAllValues(
        authUser,
        [{ field: "name", order: "ASC" }],
        {
          size: 10,
          startFrom: "FIRST",
        },
        { type: "AccountQueryFullText", keyword: { value: "Description" } }
      );
      expect(result.pageItems.map(({ data }) => data)).toStrictEqual(
        accounts.map((v) => v.toValue())
      );
    }
  });
});
