import "dotenv/config";
import { config as mikroConfig } from "@white-rabbit/business-logic";
import { Options } from "@mikro-orm/core";

export const config: Options = {
  ...mikroConfig,
  type: "postgresql",
  dbName: "white-rabbit",
};
