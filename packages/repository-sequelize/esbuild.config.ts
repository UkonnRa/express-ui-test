import { build, Tsconfig } from "../../config/build/esbuild.config";
import tsconfig from "./tsconfig.json";

void build(tsconfig as Tsconfig, {
  outdir: undefined,
  outfile: "dist/index.min.js",
  external: ["../../node_modules/*"],
}).then(() => process.exit());
