import {
  build as doBuild,
  analyzeMetafile,
  BuildOptions,
  BuildIncremental,
} from "esbuild";
import { watch } from "chokidar";
import path from "path";

const afterBuildSuccess = async (
  packageName: string,
  { metafile }: BuildIncremental
) => {
  console.log(`[${packageName}] Build successfully`);
  if (metafile && process.argv.includes("--analyze")) {
    console.log(
      `[${packageName}] Dependencies analyzed: `,
      await analyzeMetafile(metafile)
    );
  }
};

export type Tsconfig = {
  references?: { path: string }[];
};

export const build = async (tsconfig: Tsconfig, options?: BuildOptions) => {
  const packageJson = require(path.resolve(
    process.cwd(),
    "package.json"
  )) as Record<string, unknown>;
  const packageName = packageJson.name as string;
  const result = (await doBuild({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: ["node16"],
    outdir: "dist",
    metafile: true,
    sourcemap: true,
    minify: process.env.NODE_ENV === "production",
    minifyWhitespace: process.env.NODE_ENV === "production",
    minifyIdentifiers: process.env.NODE_ENV === "production",
    minifySyntax: process.env.NODE_ENV === "production",
    incremental: true,
    ...options,
  })) as BuildIncremental;
  await afterBuildSuccess(packageName, result);
  if (process.argv.includes("--watch")) {
    const dependencies =
      tsconfig.references?.map(({ path }) => `${path}/src`) ?? [];
    console.log(
      `[${packageName}] Watch files in the project src and Dependencies:`
    );
    dependencies.forEach((dependency) => console.log(`  * ${dependency}`));
    watch(["./src", ...dependencies], { ignoreInitial: true }).on(
      "all",
      async (event, path) => {
        console.log(
          `[${packageName}] Rebuild due to File[${path}] with Event[${event}]`
        );
        try {
          await afterBuildSuccess(packageName, await result.rebuild());
        } catch (e) {
          console.error(`[${packageName}] Rebuild error: `, e);
        }
      }
    );
  }
};
