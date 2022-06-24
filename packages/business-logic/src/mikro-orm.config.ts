import { Options } from "@mikro-orm/core";
import { UserEntity } from "./user";
import { GroupEntity } from "./group";
import {
  AccessItemGroupValue,
  AccessItemUserValue,
  AccessItemValue,
  JournalEntity,
} from "./journal";
import { AccountEntity } from "./account";
import { RecordEntity, RecordItemValue } from "./record";

export const config: Options = {
  discovery: { disableDynamicFileAccess: true },
  debug: process.env.DEBUG === "true",
  entities: [
    UserEntity,

    GroupEntity,

    JournalEntity,
    AccessItemValue,
    AccessItemUserValue,
    AccessItemGroupValue,

    AccountEntity,

    RecordEntity,
    RecordItemValue,
  ],
};
