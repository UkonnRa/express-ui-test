import { app } from "@storybook/vue3";
import { vueI18n, vueRouter } from "@white-rabbit/components/src/plugins";
import JournalViewApiImpl from "../api/JournalViewApiImpl";
import { JOURNAL_API_KEY } from "@white-rabbit/components";

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

app.provide(JOURNAL_API_KEY, new JournalViewApiImpl());
