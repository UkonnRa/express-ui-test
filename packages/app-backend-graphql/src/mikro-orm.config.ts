import { config as mikroConfig } from "@white-rabbit/business-logic";
import { Options } from "@mikro-orm/core";

export const config: Options = {
  ...mikroConfig,
  type: "better-sqlite",
  dbName: "test.sqlite",
};
