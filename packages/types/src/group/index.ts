export type { default as GroupQuery } from "./group.query";
export type { default as GroupCommand } from "./group.command";
export type { default as CreateGroupCommand } from "./create-group.command";
export type { default as UpdateGroupCommand } from "./update-group.command";
export type { default as DeleteGroupCommand } from "./delete-group.command";

export const GROUP_READ_SCOPE = "white-rabbit_groups:read";
export const GROUP_WRITE_SCOPE = "white-rabbit_groups:write";
