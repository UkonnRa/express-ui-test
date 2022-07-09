export type { default as UserQuery } from "./user.query";
export type { default as UserCommand } from "./user.command";
export type { default as CreateUserCommand } from "./create-user.command";
export type { default as UpdateUserCommand } from "./update-user.command";
export type { default as DeleteUserCommand } from "./delete-user.command";

export const USER_READ_SCOPE = "white-rabbit_users:read";
export const USER_WRITE_SCOPE = "white-rabbit_users:write";
