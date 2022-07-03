import { beforeAll, vi } from "vitest";
import { config } from "@vue/test-utils";
import "reflect-metadata";

(global as any).CSS = { supports: () => false };

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/* eslint-disable import/first,import/no-unresolved */
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { createVuetify } from "vuetify";
import { agGridPlugin, apiPlugin } from "@white-rabbit/components";
/* eslint-enable */

beforeAll(() => {
  config.global.plugins.push(createVuetify({ components, directives }));
  config.global.plugins.push(apiPlugin);
  config.global.plugins.push(agGridPlugin);
});
