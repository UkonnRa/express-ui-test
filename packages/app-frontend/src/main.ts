import "reflect-metadata";
import { createApp } from "vue";
import App from "@/App.vue";
import { apiPlugin, vuetifyPlugin } from "@white-rabbit/components";
import router from "./router";
import { createPinia } from "pinia";
import { ModuleRegistry } from "@ag-grid-community/core";
import { InfiniteRowModelModule } from "@ag-grid-community/infinite-row-model";
import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { MenuModule } from "@ag-grid-enterprise/menu";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  InfiniteRowModelModule,
  ClipboardModule,
  MenuModule,
  RangeSelectionModule,
]);

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(vuetifyPlugin);
app.use(apiPlugin);
app.mount("#app");
