import type { Config } from "@jest/types";

export default (config?: Config.InitialOptions): Config.InitialOptions => {
  return {
    preset: "ts-jest",
    testMatch: ["**/*.spec.ts"],
    ...config,
  };
};
