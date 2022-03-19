import {
  Journal,
  JournalValue,
  JournalQuery,
} from "@white-rabbit/business-logic/src/domains/journal";
import {
  FinRecord,
  FinRecordQuery,
  FinRecordValue,
} from "@white-rabbit/business-logic/src/domains/fin-record";
import {
  Group,
  GroupQuery,
  GroupValue,
} from "@white-rabbit/business-logic/src/domains/group";
import {
  TYPE_USER,
  User,
  UserQuery,
  UserValue,
} from "@white-rabbit/business-logic/src/domains/user";
import { container } from "tsyringe";
import {
  FieldNotQueryableError,
  InvalidSortFieldError,
} from "@white-rabbit/business-logic/src/shared/errors";
import {
  Account,
  AccountQuery,
  AccountValue,
  TYPE_ACCOUNT,
} from "@white-rabbit/business-logic/src/domains/account";
import {
  AccountRepository,
  FinRecordRepository,
  GroupRepository,
  JournalRepository,
  UserRepository,
} from "@white-rabbit/business-logic/src/domains";
import MemoryRepository from "./memory-repository";

export class MemoryAccountRepository
  extends MemoryRepository<Account, AccountValue, AccountQuery>
  implements AccountRepository
{
  doCompare(a: Account, b: Account, field: string): number {
    if (field === "id") {
      return a.id.localeCompare(b.id);
    }
    if (field === "name") {
      return a.nameValue.localeCompare(b.nameValue);
    }
    if (field === "accountType") {
      return a.accountType.valueOf() - b.accountType.valueOf();
    }
    if (field === "unit") {
      return a.unit.localeCompare(b.unit);
    }
    if (field === "strategy") {
      return a.strategy.valueOf() - b.strategy.valueOf();
    }
    throw new InvalidSortFieldError(TYPE_ACCOUNT, field);
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  doQuery(entity: Account, query?: AccountQuery): boolean {
    if (query?.type === "AccountQueryFullText") {
      const { fields, value } = query.keyword;

      let result = false;

      for (const field of fields ?? ["name", "description"]) {
        if (field === "name") {
          result = result || entity.name.some((n: string) => n.includes(value));
        } else if (field === "description") {
          result = result || entity.description.includes(value);
        } else {
          throw new FieldNotQueryableError(TYPE_ACCOUNT, field);
        }
      }
      return result;
    }

    if (query?.type === "AccountQueryByJournal") {
      const isJournal = entity.journal.id !== query.journal;
      const isAccountType = Boolean(
        query.accountType != null || query.accountType === entity.accountType
      );
      const isUnit = Boolean(query.unit != null || query.unit === entity.unit);
      const isStrategy = Boolean(
        query.strategy != null || query.strategy === entity.strategy
      );
      return isJournal && isAccountType && isUnit && isStrategy;
    }

    return true;
  }
}

export class MemoryFinRecordRepository
  extends MemoryRepository<FinRecord, FinRecordValue, FinRecordQuery>
  implements FinRecordRepository
{
  doCompare(): number {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error("Method not implemented.");
  }

  doQuery(): boolean {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error("Method not implemented.");
  }
}

export class MemoryGroupRepository
  extends MemoryRepository<Group, GroupValue, GroupQuery>
  implements GroupRepository
{
  doCompare(): number {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error("Method not implemented.");
  }

  doQuery(): boolean {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error("Method not implemented.");
  }
}

export class MemoryJournalRepository
  extends MemoryRepository<Journal, JournalValue, JournalQuery>
  implements JournalRepository
{
  doCompare(): number {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error("Method not implemented.");
  }

  doQuery(): boolean {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error("Method not implemented.");
  }
}

export class MemoryUserRepository
  extends MemoryRepository<User, UserValue, UserQuery>
  implements UserRepository
{
  doCompare(a: User, b: User, field: string): number {
    if (field === "id") {
      return a.id.localeCompare(b.id);
    }
    if (field === "name") {
      return a.name.localeCompare(b.name);
    }
    if (field === "role") {
      return a.role.valueOf() - b.role.valueOf();
    }
    throw new InvalidSortFieldError(TYPE_USER, field);
  }

  doQuery(entity: User, query?: UserQuery): boolean {
    if (query?.type === "UserQueryFullText") {
      const { fields, value } = query.keyword;

      let result = false;

      for (const field of fields ?? ["name"]) {
        if (field === "name") {
          result = result || entity.name.includes(value);
        } else {
          throw new FieldNotQueryableError(TYPE_USER, field);
        }
      }
      return result;
    }

    return true;
  }
}

export const initMemoryRepositories = async (): Promise<void> => {
  container.register("AccountRepository", {
    useValue: new MemoryAccountRepository(),
  });
  container.register("FinRecordRepository", {
    useValue: new MemoryFinRecordRepository(),
  });
  container.register("GroupRepository", {
    useValue: new MemoryGroupRepository(),
  });
  container.register("JournalRepository", {
    useValue: new MemoryJournalRepository(),
  });
  container.register("UserRepository", {
    useValue: new MemoryUserRepository(),
  });
};
