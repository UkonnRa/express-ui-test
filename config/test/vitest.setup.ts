import { config } from "@vue/test-utils";
import JournalViewApiImpl from "../api/JournalViewApiImpl";
import vueI18nConfig from "@white-rabbit/components/src/plugins/i18n";

config.global.provide["JournalViewApi"] = new JournalViewApiImpl();
config.global.plugins.push(vueI18nConfig);
