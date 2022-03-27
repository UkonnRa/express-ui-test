import { app } from "@storybook/vue3";
import { vuetifyConfig } from "@white-rabbit/components/src/plugins";
import "@mdi/font/css/materialdesignicons.css";

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
    template: "<v-app style='height: 100vh'><story /></v-app>",
  }),
];

app.use(vuetifyConfig);
