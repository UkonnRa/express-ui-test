import { createApp } from "vue";
import App from "./App.vue";
import { vueI18n, vueRouter } from "@white-rabbit/components/src/plugins";
import JournalViewApiImpl from "./api/JournalViewApiImpl";
import { JOURNAL_API_KEY } from "@white-rabbit/components";

const app = createApp(App);
app.use(vueI18n);
app.use(vueRouter);
app.provide(JOURNAL_API_KEY, new JournalViewApiImpl());
app.mount("#app");
