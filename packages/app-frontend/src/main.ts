import "reflect-metadata";
import { createApp } from "vue";
import App from "@/App.vue";
import { apiPlugin, vuetifyPlugin } from "@white-rabbit/components";

const app = createApp(App);
app.use(vuetifyPlugin);
app.use(apiPlugin);
app.mount("#app");
