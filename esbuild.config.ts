import { build as doBuild, BuildOptions, BuildIncremental } from "esbuild";
import { watch } from "chokidar";
import * as path from "path";
import { ChildProcess, execFile } from "child_process";
import { visualizer } from "esbuild-visualizer/dist/plugin";
import { promises as fs } from "fs";

const afterBuildSuccess = async (
  packageName: string,
  result: BuildIncremental
): Promise<void> => {
  console.log(`[${packageName}] Build successfully`);
  if (result.metafile != null) {
    await fs.writeFile("stats.html", await visualizer(result.metafile));
  }
};

export interface Tsconfig {
  references?: Array<{ path: string }>;
}

export interface ExecOptions {
  start: () => ChildProcess;
  stop: (process: ChildProcess) => void;
}

const start = (packageName: string) => (): ChildProcess => {
  return execFile("node", ["./dist/index.js"], (err) => {
    if (err != null) {
      if (err.signal === "SIGTERM") {
        console.log(`[${packageName}] Killed index.js`);
      } else {
        console.error(`[${packageName}] Error when running index.js: `, err);
      }
    }
  });
};

const stop = (packageName: string) => (process: ChildProcess) => {
  console.log(`[${packageName}] Kill node process`);
  process.stdout?.destroy();
  process.stderr?.destroy();
  process.kill();
};

export const build = async (
  tsconfig: Tsconfig,
  options?: BuildOptions,
  execOptions?: ExecOptions,
  processEndDirectly: boolean = true
  // eslint-disable-next-line sonarjs/cognitive-complexity
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
    const startFunc = execOptions?.start ?? start(packageName);
    let process = startFunc();
    process.stdout?.on("data", (data) => {
      if (data.length > 0) {
        console.log(`[${packageName}] Stdout:`, data);
      }
    });
    process.stderr?.on("data", (data) => {
      if (data.length > 0) {
        console.log(`[${packageName}] Stderr:`, data);
      }
    });
    watch(["./src", ...dependencies], { ignoreInitial: true }).on(
      "all",
      (event, file) => {
        void (async () => {
          try {
            const stopFunc = execOptions?.stop ?? stop(packageName);
            if (process != null) {
              stopFunc(process);
            }
            console.log(
              `[${packageName}] Rebuild due to File[${file}] with Event[${event}]`
            );
            await afterBuildSuccess(packageName, await result.rebuild());
            process = startFunc();
          } catch (e) {
            console.error(`[${packageName}] Rebuild error: `, e);
          }
        })();
      }
    );
  } else if (processEndDirectly) {
    process.exit();
  }
};
