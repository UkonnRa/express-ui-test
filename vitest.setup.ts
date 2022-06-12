/* eslint-disable import/first,import/no-unresolved */
(global as any).CSS = { supports: () => false };

import { beforeAll, beforeEach } from "vitest";
import { config } from "@vue/test-utils";

import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { createVuetify } from "vuetify";
/* eslint-enable */

beforeAll(() => {
  global.CSS = {
    supports: () => false,
    escape: (str: string) => str,
  };
});

beforeEach(() => {
  config.global.plugins.push(createVuetify({ components, directives }));
});
