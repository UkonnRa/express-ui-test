import { app } from "@storybook/vue3";
import {
  vueI18nConfig,
  vuetifyOptions,
} from "@white-rabbit/components/src/plugins";
import "@mdi/font/css/materialdesignicons.css";
import JournalViewApiImpl from "../api/JournalViewApiImpl";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

// wrap all stories in `v-app`
export const decorators = [
  (story: unknown) => ({
    components: { story },
    template: "<v-app><story /></v-app>",
  }),
];

app.use(
  createVuetify({
    ...vuetifyOptions,
    components,
    directives,
  })
);
app.use(vueI18nConfig);

app.provide("JournalViewApi", new JournalViewApiImpl());
