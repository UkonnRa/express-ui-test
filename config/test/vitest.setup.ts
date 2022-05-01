import { config } from "@vue/test-utils";
import JournalViewApiImpl from "../api/JournalViewApiImpl";
import { JOURNAL_API_KEY } from "@white-rabbit/components";
import Antd from "ant-design-vue";
import { vueRouter, vueI18n } from "@white-rabbit/components/src/plugins";
import { vi } from "vitest";

config.global.provide[JOURNAL_API_KEY as any] = new JournalViewApiImpl();
config.global.plugins.push(vueI18n, Antd, vueRouter);
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
