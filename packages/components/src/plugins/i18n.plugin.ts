import { createI18n } from "vue-i18n";
import en from "../locales/en.json";
import zhHans from "../locales/zh-Hans.json";

export default createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en,
    "zh-Hans": zhHans,
  },
});

export const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  "zh-Hans": "简体中文",
};
