import { createApp } from "vue";

import App from "./App.vue";

const app = createApp(App);

app.mount("#app");

console.log("fs", window.fs);
console.log("ipcRenderer", window.ipcRenderer);
