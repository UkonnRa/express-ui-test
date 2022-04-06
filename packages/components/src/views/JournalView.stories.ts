import JournalView from "./JournalView.vue";
import type { Story } from "@storybook/vue3";

const Template: Story = (args) => ({
  components: { JournalView },
  setup: () => ({ args }),
  template: "<journal-view></journal-view>",
});

export const Primary = Template.bind({});

export default {
  title: "Domains/Journals View",
  component: JournalView,
};
