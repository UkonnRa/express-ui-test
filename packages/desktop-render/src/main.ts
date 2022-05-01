import { createApp } from "vue";
import App from "./App.vue";
import { vueI18n, vueRouter } from "@white-rabbit/components/src/plugins";
import AccessItemApiImpl from "./api/AccessItemApiImpl";
import { ACCESS_ITEM_API_KEY } from "@white-rabbit/components";

const app = createApp(App);
app.use(vueI18n);
app.use(vueRouter);
app.provide(ACCESS_ITEM_API_KEY, new AccessItemApiImpl());
app.mount("#app");

console.log("fs", window.fs);
console.log("ipcRenderer", window.ipcRenderer);
