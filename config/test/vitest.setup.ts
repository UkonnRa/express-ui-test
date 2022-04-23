import { config } from "@vue/test-utils";
import JournalViewApiImpl from "../api/JournalViewApiImpl";
import vueI18nConfig from "@white-rabbit/components/src/plugins/i18n";
import { JOURNAL_API_KEY } from "@white-rabbit/components";

config.global.provide[JOURNAL_API_KEY as any] = new JournalViewApiImpl();
config.global.plugins.push(vueI18nConfig);
