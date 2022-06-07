import { build } from "../../esbuild.config";
import tsconfig from "./tsconfig.json";
import appPackage from "./package.json";
import knexPackage from "knex/package.json";
import mikroCorePackage from "@mikro-orm/core/package.json";

const prodModules = [...Object.keys(appPackage.dependencies)];

const optionalModules = Array.from(
  new Set([
    ...Object.keys(knexPackage.browser),
    ...Object.keys(mikroCorePackage.peerDependencies),
  ])
).filter((dep) => !prodModules.includes(dep));

void build(tsconfig, {
  external: [...optionalModules],
});
