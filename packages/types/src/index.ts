import { ACCOUNT_READ_SCOPE, ACCOUNT_WRITE_SCOPE } from "./account";
import { GROUP_READ_SCOPE, GROUP_WRITE_SCOPE } from "./group";
import { JOURNAL_READ_SCOPE, JOURNAL_WRITE_SCOPE } from "./journal";
import { RECORD_READ_SCOPE, RECORD_WRITE_SCOPE } from "./record";
import { USER_READ_SCOPE, USER_WRITE_SCOPE } from "./user";

export * from "./shared";

export * from "./user";
export * from "./group";
export * from "./journal";
export * from "./account";
export * from "./record";

export const ALL_SCOPES = [
  ACCOUNT_READ_SCOPE,
  ACCOUNT_WRITE_SCOPE,
  GROUP_READ_SCOPE,
  GROUP_WRITE_SCOPE,
  JOURNAL_READ_SCOPE,
  JOURNAL_WRITE_SCOPE,
  RECORD_READ_SCOPE,
  RECORD_WRITE_SCOPE,
  USER_READ_SCOPE,
  USER_WRITE_SCOPE,
];
