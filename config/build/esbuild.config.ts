import {
  build as doBuild,
  analyzeMetafile,
  BuildOptions,
  BuildIncremental,
} from "esbuild";
import { watch } from "chokidar";
import path from "path";
import { ChildProcess } from "child_process";

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

export type ExecOptions = {
  start: () => ChildProcess;
  stop: (process: ChildProcess) => void;
};

export const build = async (
  tsconfig: Tsconfig,
  options?: BuildOptions,
  execOptions?: ExecOptions,
  processEndDirectly: boolean = true
) => {
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
      tsconfig.references?.map((ref) => `${ref.path}/src`) ?? [];
    console.log(
      `[${packageName}] Start watching files in the project **src** and Dependencies:`
    );
    dependencies.forEach((dependency) => console.log(`  * ${dependency}`));
    let process = execOptions?.start();
    watch(["./src", ...dependencies], { ignoreInitial: true }).on(
      "all",
      async (event, file) => {
        try {
          if (execOptions && process) {
            execOptions.stop(process);
          }
          console.log(
            `[${packageName}] Rebuild due to File[${file}] with Event[${event}]`
          );
          await afterBuildSuccess(packageName, await result.rebuild());
          process = execOptions?.start();
        } catch (e) {
          console.error(`[${packageName}] Rebuild error: `, e);
        }
      }
    );
  } else if (processEndDirectly) {
    process.exit();
  }
};
