export { default as AccountStrategyValue } from "./account-strategy.value";
export { default as AccountTypeValue } from "./account-type.value";

export type { default as AccountQuery } from "./account.query";
export type { default as AccountCommand } from "./account.command";
export type { default as CreateAccountCommand } from "./create-account.command";
export type { default as UpdateAccountCommand } from "./update-account.command";
export type { default as DeleteAccountCommand } from "./delete-account.command";

export const ACCOUNT_READ_SCOPE = "white-rabbit_accounts:read";
export const ACCOUNT_WRITE_SCOPE = "white-rabbit_accounts:write";
