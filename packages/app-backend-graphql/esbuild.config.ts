/* eslint-disable @typescript-eslint/no-var-requires */
import { build } from "../../esbuild.config";

const prodModules = Object.keys(require("./package.json").dependencies);

const optionalModules = Array.from(
  new Set([
    ...Object.keys(require("knex/package.json").browser),
    ...Object.keys(require("@mikro-orm/core/package.json").peerDependencies),
  ])
).filter((dep) => !prodModules.includes(dep));

void build(require("./tsconfig.json"), {
  external: [...optionalModules],
});
