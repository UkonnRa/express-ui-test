import { config } from "@vue/test-utils";
import JournalViewApiImpl from "../api/JournalViewApiImpl";
import { JOURNAL_API_KEY } from "@white-rabbit/components";
import Antd from "ant-design-vue";
import { vueRouter, vueI18n } from "@white-rabbit/components/src/plugins";

config.global.provide[JOURNAL_API_KEY as any] = new JournalViewApiImpl();
config.global.plugins.push(vueI18n, Antd, vueRouter);
