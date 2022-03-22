import { createApp } from "vue";
import App from "./App.vue";
import "@mdi/font/css/materialdesignicons.css";
import { loadFonts, vuetifyConfig } from "@white-rabbit/components/src/plugins";

void loadFonts();
const app = createApp(App);
app.use(vuetifyConfig);
app.mount("#app");

console.log("fs", window.fs);
console.log("ipcRenderer", window.ipcRenderer);
