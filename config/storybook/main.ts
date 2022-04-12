import path from "path";
import type { StorybookConfig } from "@storybook/core-common";
import { mergeConfig, UserConfig } from "vite";

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
      resolve: {
        // https://github.com/storybookjs/storybook/issues/10887#issuecomment-901109891
        dedupe: ["@storybook/client-api"],
      },
    });
  },
} as StorybookConfig;
