import "reflect-metadata";
import { createApp } from "vue";
import App from "@/App.vue";
import {
  agGridPlugin,
  apiPlugin,
  routerPlugin,
  vuetifyPlugin,
} from "@white-rabbit/components";
import { createPinia } from "pinia";

const app = createApp(App);
app.use(createPinia());
app.use(routerPlugin);
app.use(agGridPlugin);
app.use(vuetifyPlugin);
app.use(apiPlugin);
app.mount("#app");
