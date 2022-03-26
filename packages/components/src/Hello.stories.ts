import Hello from "./Hello.vue";

const Template = () => ({
  components: { Hello },
  template: "<hello></hello>",
});

export const Primary = Template.bind({});

export default {
  title: "Example/Hello",
  component: Hello,
};
