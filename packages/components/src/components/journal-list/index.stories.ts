import JournalList, { type Props } from "./index.vue";
import type { Story } from "@storybook/vue3";
import { v4 } from "uuid";

const Template: Story<Props> = (args) => ({
  components: { JournalList },
  setup: () => ({ args }),
  template:
    "<v-expansion-panels><journal-list v-bind='args'></journal-list><journal-list v-bind='args'></journal-list><journal-list v-bind='args'></journal-list></v-expansion-panels>",
});

export const Primary = Template.bind({});
Primary.args = {
  id: v4(),
  name: "Journal Primary",
  description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ornare odio eu purus tincidunt, vitae auctor est bibendum. Phasellus luctus lectus id diam consequat imperdiet. Sed luctus molestie nisi a convallis. In facilisis ligula eget mauris mollis elementum Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ornare odio eu purus tincidunt, vitae auctor est bibendum. Phasellus luctus lectus id diam consequat imperdiet. Sed luctus molestie nisi a convallis. In facilisis ligula eget mauris mollis elementum\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ornare odio eu purus tincidunt, vitae auctor est bibendum. Phasellus luctus lectus id diam consequat imperdiet. Sed luctus molestie nisi a convallis. In facilisis ligula eget mauris mollis elementum Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ornare odio eu purus tincidunt, vitae auctor est bibendum. Phasellus luctus lectus id diam consequat imperdiet. Sed luctus molestie nisi a convallis. In facilisis ligula eget mauris mollis elementum`,
  admins: Array(20)
    .fill(null)
    .map((_, idx) => {
      const id = v4();
      let name = "a";
      if (idx % 3 === 1) {
        name = `Group Name ${idx}`;
      } else if (idx % 3 === 2) {
        name = `Group Name ${id} ${id}`;
      }
      return {
        type: "GROUP",
        id,
        name,
      };
    }),
  members: Array(20)
    .fill(null)
    .map((_, idx) => {
      const id = v4();
      let name = "a";
      if (idx % 3 === 1) {
        name = `User Name ${idx}`;
      } else if (idx % 3 === 2) {
        name = `User Name ${id} ${id}`;
      }
      return {
        type: "USER",
        id,
        name,
      };
    }),
};

export default {
  title: "Components/Journal List",
  component: JournalList,
};
