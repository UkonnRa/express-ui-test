import type { Config } from "@jest/types";

export type Tsconfig = {
  references?: { path: string }[];
};

export default (config?: Config.InitialOptions): Config.InitialOptions => {
  return {
    preset: "ts-jest",
    testMatch: ["**/__tests__/**/*.spec.ts"],
    ...config,
  };
};
