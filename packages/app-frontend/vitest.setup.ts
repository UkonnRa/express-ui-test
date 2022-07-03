import { beforeAll } from "vitest";
import { createPinia } from "pinia";
import { markRaw } from "vue";
import { authManager } from "./src/services";
import { config } from "@vue/test-utils";

beforeAll(() => {
  const pinia = createPinia();
  pinia.use(() => {
    return { authManager: markRaw(authManager) };
  });
  config.global.plugins.push(pinia);
});
