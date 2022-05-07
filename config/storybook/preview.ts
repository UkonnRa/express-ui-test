import { app } from "@storybook/vue3";
import { vueI18n, vueRouter } from "@white-rabbit/components/src/plugins";
import AccessItemApiImpl from "../api/AccessItemApiImpl";
import { ACCESS_ITEM_API_KEY } from "@white-rabbit/components/src/api";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (story: unknown) => ({
    components: { story },
    template: "<story />",
  }),
];

app.use(vueI18n);
app.use(vueRouter);

app.provide(ACCESS_ITEM_API_KEY, new AccessItemApiImpl());
