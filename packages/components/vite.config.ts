import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vuetify from "@vuetify/vite-plugin";
import { vueI18n } from "@intlify/vite-plugin-vue-i18n";
import path from "path";

export default defineConfig((env) => ({
  plugins: [
    vue(),
    vuetify({
      autoImport: env.mode !== "test",
      styles: env.mode === "test" ? "none" : undefined,
    }),
    vueI18n({
      include: path.resolve(__dirname, "src/locales/**"),
    }),
  ],
  alias: {
    "vue-i18n": "vue-i18n/dist/vue-i18n.runtime.esm-bundler.js",
  },
  test: {
    environment: "jsdom",
    coverage: {
      reporter: ["lcov", "html"],
    },
    setupFiles: ["../../config/test/vitest.setup.ts"],
  },
}));
