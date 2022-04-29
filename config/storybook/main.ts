import path from "path";
import type { StorybookConfig } from "@storybook/core-common";
import { mergeConfig, UserConfig } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

export default {
  stories: [
    path.resolve(process.cwd(), "src/**/*.stories.mdx"),
    path.resolve(process.cwd(), "src/**/*.stories.@(js|jsx|ts|tsx)"),
  ],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  framework: "@storybook/vue3",
  core: {
    builder: "@storybook/builder-vite",
  },
  async viteFinal(config: UserConfig) {
    return mergeConfig(config, {
      plugins: [
        Components({
          dts: false,
          resolvers: [AntDesignVueResolver()],
        }),
        AutoImport({
          dts: false,
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
      resolve: {
        // https://github.com/storybookjs/storybook/issues/10887#issuecomment-901109891
        dedupe: ["@storybook/client-api"],
      },
    });
  },
} as StorybookConfig;
