import { Options } from "@mikro-orm/core";
import { AuthIdValue, UserEntity } from "./user";
import { GroupEntity } from "./group";
import {
  AccessItemGroupValue,
  AccessItemUserValue,
  AccessItemValue,
  JournalEntity,
} from "./journal";
import { AccountEntity } from "./account";

export const config: Options = {
  discovery: { disableDynamicFileAccess: true },
  entities: [
    UserEntity,
    AuthIdValue,

    GroupEntity,

    JournalEntity,
    AccessItemValue,
    AccessItemUserValue,
    AccessItemGroupValue,

    AccountEntity,
  ],
};
