import {
  Journal,
  AccessList,
  FinRecord,
  FinRecordQuery,
  Group,
  GroupQuery,
  User,
  UserQuery,
  FieldNotQueryableError,
  InvalidSortFieldError,
  Account,
  AccountRepository,
  FinRecordRepository,
  GroupRepository,
  JournalRepository,
  UserRepository,
} from "@white-rabbit/business-logic";
import { container } from "tsyringe";
import dayjs from "dayjs";
import {
  AccessItemValue,
  AccountQuery,
  AccountValue,
  FinRecordValue,
  GroupValue,
  JournalQuery,
  JournalQueryFuzzySearch,
  JournalValue,
  TYPE_ACCOUNT,
  TYPE_GROUP,
  TYPE_JOURNAL,
  TYPE_USER,
  UserValue,
} from "@white-rabbit/type-bridge";
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
      if (query.journal !== entity.journal.id) {
        return false;
      }

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
  doCompare(a: Group, b: Group, field: string): number {
    if (field === "id") {
      return a.id.localeCompare(b.id);
    }
    if (field === "name") {
      return a.name.localeCompare(b.name);
    }
    if (field === "description") {
      return a.description.localeCompare(b.description);
    }
    throw new InvalidSortFieldError(TYPE_GROUP, field);
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  doQuery(entity: Group, query?: GroupQuery): boolean {
    if (query?.type === "GroupQueryFullText") {
      const { fields, value } = query.keyword;

      let result = false;

      for (const field of fields ?? ["name", "description"]) {
        if (field === "name") {
          result = result || entity.name.includes(value);
        } else if (field === "description") {
          result = result || entity.description.includes(value);
        } else {
          throw new FieldNotQueryableError(TYPE_GROUP, field);
        }
      }
      return result;
    }

    if (query?.type === "GroupQueryByUser") {
      return entity.contains(query.user, query.field);
    }

    return true;
  }
}

export class MemoryJournalRepository
  extends MemoryRepository<Journal, JournalValue, JournalQuery>
  implements JournalRepository
{
  private static nullableDateCompare(
    defaultValue: number,
    a?: Date,
    b?: Date
  ): number {
    const aMillis = a === undefined ? defaultValue : dayjs(a).valueOf();
    const bMillis = b === undefined ? defaultValue : dayjs(b).valueOf();
    return aMillis - bMillis;
  }

  doCompare(a: Journal, b: Journal, field: string): number {
    if (field === "id") {
      return a.id.localeCompare(b.id);
    }
    if (field === "name") {
      return a.name.localeCompare(b.name);
    }
    if (field === "description") {
      return a.description.localeCompare(b.description);
    }
    if (field === "startDate") {
      return MemoryJournalRepository.nullableDateCompare(
        Number.MIN_VALUE,
        a.startDate,
        b.startDate
      );
    }
    if (field === "endDate") {
      return MemoryJournalRepository.nullableDateCompare(
        Number.MAX_VALUE,
        a.endDate,
        b.endDate
      );
    }
    throw new InvalidSortFieldError(TYPE_JOURNAL, field);
  }

  private doFindItem(list: AccessList, queryItem: AccessItemValue): boolean {
    return (
      list.find((item) => {
        if (
          (item instanceof User && queryItem.type === TYPE_USER) ||
          (item instanceof Group && queryItem.type === TYPE_GROUP)
        ) {
          return item.id === queryItem.id;
        }
        return false;
      }) !== undefined
    );
  }

  private doQueryFuzzySearch(
    entity: Journal,
    query: JournalQueryFuzzySearch
  ): boolean {
    let result = true;

    if (!query.includingArchived) {
      result = result && !entity.archived;
    }

    if (query.keyword != null) {
      result =
        result &&
        (entity.name.includes(query.keyword) ||
          entity.description.includes(query.keyword));
    }

    if (query.startDate != null && entity.endDate != null) {
      result = result && !dayjs(query.startDate).isAfter(entity.endDate);
    }

    if (query.endDate != null && entity.startDate != null) {
      result = result && !dayjs(entity.startDate).isAfter(query.endDate);
    }

    if (query.accessItem != null) {
      result =
        result &&
        (this.doFindItem(entity.admins, query.accessItem) ||
          this.doFindItem(entity.members, query.accessItem));
    }

    return result;
  }

  doQuery(entity: Journal, query?: JournalQuery): boolean {
    if (query?.type === "JournalQueryFullText") {
      const { fields, value } = query.keyword;

      let result = false;

      for (const field of fields ?? ["name"]) {
        if (field === "name") {
          result = result || entity.name.includes(value);
        } else {
          throw new FieldNotQueryableError(TYPE_JOURNAL, field);
        }
      }
      return result;
    }

    if (query?.type === "JournalQueryAccessItem") {
      return (
        this.doFindItem(entity.admins, query.accessItem) ||
        this.doFindItem(entity.members, query.accessItem)
      );
    }

    if (query?.type === "JournalQueryFuzzySearch") {
      return this.doQueryFuzzySearch(entity, query);
    }

    return true;
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
