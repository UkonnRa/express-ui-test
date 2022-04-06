import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "@vuetify/vite-plugin";
import visualizer from "rollup-plugin-visualizer";

export default defineConfig((env) => ({
  plugins: [
    vue(),
    vuetify({
      autoImport: env.mode !== "test",
      styles: env.mode === "test" ? "none" : undefined,
    }),
    visualizer({
      openOptions: {
        wait: false,
      },
    }),
  ],
  test: {
    environment: "jsdom",
    coverage: {
      reporter: ["lcov", "html"],
    },
    setupFiles: ["../../config/test/vitest.setup.ts"],
  },
}));
