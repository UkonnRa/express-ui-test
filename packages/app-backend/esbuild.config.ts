import { execFile } from "child_process";
import { build } from "../../config/build/esbuild.config";
import tsconfig from "./tsconfig.json";

void build(
  tsconfig,
  {
    external: ["pg-hstore"],
    treeShaking: false,
  },
  {
    start: () => {
      return execFile("node", ["./dist/index.js"], (err) => {
        if (err != null) {
          if (err.signal === "SIGTERM") {
            console.log("[@white-rabbit/app-backend] Killed index.js");
          } else {
            console.error(
              "[@white-rabbit/app-backend] Error when running index.js: ",
              err
            );
          }
        }
      });
    },
    stop: (process) => {
      console.log("[@white-rabbit/app-backend] Kill node process");
      process.stdout?.destroy();
      process.stderr?.destroy();
      process.kill();
    },
  }
);
