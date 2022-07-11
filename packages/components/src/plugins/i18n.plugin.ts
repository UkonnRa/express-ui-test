import { createI18n } from "vue-i18n";
import en from "../locales/en.json";
import zhHans from "../locales/zhHans.json";
import * as vuetifyLocale from "vuetify/locale";

export default createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en: {
      ...en,
      $vuetify: vuetifyLocale.en,
    },
    zhHans: {
      ...zhHans,
      $vuetify: vuetifyLocale.zhHans,
    },
  },
});

export const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  zhHans: "简体中文",
};
