import { Options } from "@mikro-orm/core";
import { AuthIdValue, UserEntity } from "./user";
import { GroupEntity } from "./group";
import {
  AccessItemGroupValue,
  AccessItemUserValue,
  AccessItemValue,
  JournalEntity,
} from "./journal";

export const config: Options = {
  discovery: { disableDynamicFileAccess: true },
  entities: [
    UserEntity,
    GroupEntity,
    AuthIdValue,
    JournalEntity,
    AccessItemValue,
    AccessItemUserValue,
    AccessItemGroupValue,
  ],
};
