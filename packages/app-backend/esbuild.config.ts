import { build } from "../../config/build/esbuild.config";
import tsconfig from "./tsconfig.json";

void build(tsconfig, {
  external: ["pg-hstore"],
}).then(() => process.exit());
