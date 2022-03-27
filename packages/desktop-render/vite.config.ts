import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "@vuetify/vite-plugin";

export default defineConfig((env) => ({
  plugins: [
    vue(),
    vuetify({
      autoImport: env.mode !== "test",
      styles: env.mode === "test" ? "none" : undefined,
    }),
  ],
  test: {
    environment: "jsdom",
    coverage: {
      reporter: ["lcov", "html"],
    },
  },
  base: "",
}));
