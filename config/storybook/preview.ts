import { app } from "@storybook/vue3";
import { vueI18nConfig } from "@white-rabbit/components/src/plugins";
import JournalViewApiImpl from "../api/JournalViewApiImpl";
import { JOURNAL_API_KEY } from "@white-rabbit/components";
import "ant-design-vue/dist/antd.variable.less";

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

app.use(vueI18nConfig);

app.provide(JOURNAL_API_KEY, new JournalViewApiImpl());
