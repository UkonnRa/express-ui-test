import { Options } from "@mikro-orm/core";
import { AuthIdValue, UserEntity } from "./user";
import { GroupEntity } from "./group";

export const config: Options = {
  discovery: { disableDynamicFileAccess: true },
  entities: [UserEntity, GroupEntity, AuthIdValue],
};
