import { Options } from "@mikro-orm/core";

export const config: Options = {
  discovery: { disableDynamicFileAccess: true },
  entities: [],
};
