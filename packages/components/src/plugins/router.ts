import { createRouter, createWebHashHistory } from "vue-router";
import { routes } from "../routes";
import { ConfigProvider } from "ant-design-vue";
import "ant-design-vue/dist/antd.variable.less";

ConfigProvider.config({
  theme: {
    primaryColor: "#fa8c16",
  },
});

export const vueRouter = createRouter({
  history: createWebHashHistory(),
  routes,
});
