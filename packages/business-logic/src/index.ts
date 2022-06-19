import { USER_READ_SCOPE, USER_WRITE_SCOPE } from "./user";
import { GROUP_READ_SCOPE, GROUP_WRITE_SCOPE } from "./group";
import { JOURNAL_READ_SCOPE, JOURNAL_WRITE_SCOPE } from "./journal";

export * from "./error";
export * from "./shared";
export * from "./utils";

export * from "./group";
export * from "./user";
export * from "./journal";

export * from "./mikro-orm.config";

export const ALL_SCOPES = [
  USER_READ_SCOPE,
  USER_WRITE_SCOPE,
  GROUP_READ_SCOPE,
  GROUP_WRITE_SCOPE,
  JOURNAL_READ_SCOPE,
  JOURNAL_WRITE_SCOPE,
];
