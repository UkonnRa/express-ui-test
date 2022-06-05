import { config as mikroConfig } from "./src/mikro-orm.config";
import { Options } from "@mikro-orm/core";

export const config: Options = {
  ...mikroConfig,
  discovery: { disableDynamicFileAccess: false },
  seeder: {
    path: "./seeders",
    defaultSeeder: "DefaultSeeder",
    glob: "!(*.d).{js,ts}",
    emit: "ts",
    fileName: (className: string) => className,
  },
};
