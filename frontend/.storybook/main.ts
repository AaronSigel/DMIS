import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import { appAlias } from "../vite.config";

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(baseConfig) {
    return mergeConfig(baseConfig, {
      resolve: {
        alias: appAlias,
      },
    });
  },
};

export default config;
