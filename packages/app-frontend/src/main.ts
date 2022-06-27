import "reflect-metadata";
import { createApp } from "vue";
import App from "@/App.vue";
import { apiPlugin, vuetifyPlugin } from "@white-rabbit/components";
import router from "./router";
import { createPinia } from "pinia";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(vuetifyPlugin);
app.use(apiPlugin);
app.mount("#app");
