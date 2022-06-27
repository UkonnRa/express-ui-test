import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { fileURLToPath } from "url";
import { visualizer } from "rollup-plugin-visualizer";
import vuetify from "vite-plugin-vuetify";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [vue(), visualizer(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src"),
    },
  },
  server: {
    https: true,
  },
  test: {
    environment: "jsdom",
    coverage: {
      reporter: ["lcov", "html"],
    },
    setupFiles: ["../../vitest.setup.ts"],
    deps: {
      inline: ["vuetify"],
    },
  },
}));
