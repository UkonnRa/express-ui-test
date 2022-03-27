import Scaffold, { type Props } from "./index.vue";
import type { Story } from "@storybook/vue3";

const Template: Story<Props> = (args) => ({
  components: { Scaffold },
  setup: () => ({ args }),
  template: "<scaffold></scaffold>",
});

export const Primary = Template.bind({});

export default {
  title: "Components/Scaffold",
  component: Scaffold,
};
