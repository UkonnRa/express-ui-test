import { AbstractRepository } from "../shared/abstract-repository";
import { User, UserQuery, UserValue } from "./user";
import { Journal, JournalQuery, JournalValue } from "./journal";
import { Group, GroupQuery, GroupValue } from "./group";
import { FinRecord, FinRecordQuery, FinRecordValue } from "./fin-record";
import { Account, AccountQuery, AccountValue } from "./account";

export { default as AccountService } from "./account/account-service";
export type AccountRepository = AbstractRepository<
  Account,
  AccountValue,
  AccountQuery
>;

export { default as FinRecordService } from "./fin-record/fin-record-service";
export type FinRecordRepository = AbstractRepository<
  FinRecord,
  FinRecordValue,
  FinRecordQuery
>;

export { default as GroupService } from "./group/group-service";
export type GroupRepository = AbstractRepository<Group, GroupValue, GroupQuery>;

export { default as JournalService } from "./journal/journal-service";
export type JournalRepository = AbstractRepository<
  Journal,
  JournalValue,
  JournalQuery
>;

export { default as UserService } from "./user/user-service";
export type UserRepository = AbstractRepository<User, UserValue, UserQuery>;
