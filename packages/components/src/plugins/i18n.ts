import type { I18nOptions } from "vue-i18n";
import { createI18n } from "vue-i18n";
import { enUS, zhCN } from "../locales";

export const vueI18nOptions: I18nOptions = {
  inheritLocale: true,
  globalInjection: true,
  legacy: false,
  messages: {
    "en-US": enUS,
    "zh-CN": zhCN,
  },
};

export const vueI18n = createI18n(vueI18nOptions);
