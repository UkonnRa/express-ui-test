import path from "path";
import type { StorybookConfig } from "@storybook/core-common";

export default {
  stories: [
    path.resolve(process.cwd(), "src/**/*.stories.mdx"),
    path.resolve(process.cwd(), "src/**/*.stories.@(js|jsx|ts|tsx)"),
  ],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  framework: "@storybook/vue3",
  core: {
    builder: "storybook-builder-vite",
  },
  webpackFinal: async (config) => {
    // register webpack path aliases
    if (config.resolve?.alias) {
      config.resolve.alias["~storybook"] = path.resolve(process.cwd());
      config.resolve.alias["@"] = path.resolve(process.cwd(), "src");
    }
    // enable sass
    if (config.module?.rules) {
      config.module.rules.push({
        test: /\.sass$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      });
    }
    return config;
  },
} as StorybookConfig;
