import { createApp } from "vue";
import App from "./App.vue";
import "@mdi/font/css/materialdesignicons.css";
import {
  loadFonts,
  vueI18nConfig,
  vuetifyConfig,
} from "@white-rabbit/components/src/plugins";
import JournalViewApiImpl from "./api/JournalViewApiImpl";
import { JOURNAL_API_KEY } from "@white-rabbit/components";

void loadFonts();
const app = createApp(App);
app.use(vuetifyConfig);
app.use(vueI18nConfig);
app.provide(JOURNAL_API_KEY, new JournalViewApiImpl());
app.mount("#app");
