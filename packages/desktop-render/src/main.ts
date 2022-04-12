import { createApp } from "vue";
import App from "./App.vue";
import "@mdi/font/css/materialdesignicons.css";
import {
  loadFonts,
  vueI18nConfig,
  vuetifyConfig,
} from "@white-rabbit/components/src/plugins";
import JournalViewApiImpl from "./api/JournalViewApiImpl";

void loadFonts();
const app = createApp(App);
app.use(vuetifyConfig);
app.use(vueI18nConfig);
app.provide("JournalViewApi", new JournalViewApiImpl());
app.mount("#app");

console.log("fs", window.fs);
console.log("ipcRenderer", window.ipcRenderer);
