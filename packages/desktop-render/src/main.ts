import { createApp } from "vue";
import App from "./App.vue";
import { loadFonts, vueI18nConfig } from "@white-rabbit/components/src/plugins";
import JournalViewApiImpl from "./api/JournalViewApiImpl";
import { JOURNAL_API_KEY } from "@white-rabbit/components";
import "ant-design-vue/dist/antd.variable.less";

void loadFonts();
const app = createApp(App);
app.use(vueI18nConfig);
app.provide(JOURNAL_API_KEY, new JournalViewApiImpl());
app.mount("#app");

console.log("fs", window.fs);
console.log("ipcRenderer", window.ipcRenderer);
