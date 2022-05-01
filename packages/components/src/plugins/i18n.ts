import type { I18nOptions } from "vue-i18n";
import { createI18n } from "vue-i18n";
import { enUS, zhCN } from "../locales";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

export const LOCALE_EN_US = "en-US";
export const LOCALE_ZH_CN = "zh-CN";

export const vueI18nOptions: I18nOptions = {
  inheritLocale: true,
  globalInjection: true,
  legacy: false,
  messages: {
    [LOCALE_EN_US]: enUS,
    [LOCALE_ZH_CN]: zhCN,
  },
};

dayjs.extend(localizedFormat);

export const vueI18n = createI18n(vueI18nOptions);
