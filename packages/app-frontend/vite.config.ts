import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { fileURLToPath } from "url";
import { visualizer } from "rollup-plugin-visualizer";
import vuetify from "vite-plugin-vuetify";
import viteCompression from "vite-plugin-compression";
import * as fs from "fs";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const resolver = ElementPlusResolver({
    importStyle: "sass",
  });

  return {
    plugins: [
      vue(),
      visualizer(),
      vuetify({ autoImport: true }),
      AutoImport({
        resolvers: [resolver],
      }),
      Components({
        resolvers: [resolver],
      }),
      viteCompression({
        // https://segmentfault.com/q/1010000023153827
        success: () => {
          const files = fs.readdirSync(
            path.resolve(__dirname, "dist", "assets")
          );
          for (const file of files) {
            if (files.includes(`${file}.gz`)) {
              fs.truncateSync(
                path.resolve(__dirname, "dist", "assets", file),
                0
              );
            }
          }
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src"),
      },
    },
    test: {
      environment: "jsdom",
      coverage: {
        reporter: ["lcov", "html"],
      },
      setupFiles: ["../../vitest.setup.ts", "vitest.setup.ts"],
      deps: {
        inline: ["vuetify", "element-plus"],
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id): string | null => {
            if (id.includes("@ag-grid-community/core")) {
              return "ag-grid-community-core";
            }
            return null;
          },
        },
      },
    },
  };
});
