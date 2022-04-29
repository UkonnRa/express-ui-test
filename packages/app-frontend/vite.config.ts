/* eslint-disable import/no-unresolved */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import visualizer from "rollup-plugin-visualizer";
import { vueI18n } from "@intlify/vite-plugin-vue-i18n";
import path from "path";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";

export default defineConfig((env) => ({
  plugins: [
    vue(),
    visualizer({
      gzipSize: true,
      brotliSize: true,
      openOptions: {
        wait: false,
      },
    }),
    vueI18n({
      include: path.resolve(__dirname, "../components/src/locales/**"),
    }),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: env.mode === "test" ? false : undefined,
          cjs: env.mode === "test" ? true : undefined,
        }),
      ],
    }),
    AutoImport({
      imports: [
        "@vueuse/core",
        "@vueuse/head",
        "pinia",
        "vue-i18n",
        "vue-router",
        "vue",
      ],
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    coverage: {
      reporter: ["lcov", "html"],
    },
    setupFiles: ["../../config/test/vitest.setup.ts"],
  },
}));
