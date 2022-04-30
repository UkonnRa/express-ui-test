<template>
  <app-default-layout
    :breadcrumbs="breadcrumbs"
    :side-menu-items="sideMenuItems"
  >
    <a-button type="primary">WhiteRabbit</a-button>
    <a-button>Default Button</a-button>
    <a-button type="dashed">Dashed Button</a-button>
    <a-button type="text">Text Button</a-button>
    <a-button type="link">Link Button</a-button>
  </app-default-layout>
</template>

<script setup lang="ts">
import AppDefaultLayout from "../layouts/AppDefaultLayout.vue";
import {
  AccountBookOutlined,
  TeamOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons-vue";
import { ROUTE_JOURNALS_VIEW } from "../routes";

const breadcrumbs = [
  { name: "Journals", route: ROUTE_JOURNALS_VIEW },
  { name: "test" },
];

const sideMenuItems = [
  [
    { name: "Journals", route: ROUTE_JOURNALS_VIEW, icon: AccountBookOutlined },
    { name: "Groups", route: ROUTE_JOURNALS_VIEW, icon: TeamOutlined },
  ],
  [
    { name: "Settings", route: ROUTE_JOURNALS_VIEW, icon: SettingOutlined },
    { name: "About", route: ROUTE_JOURNALS_VIEW, icon: QuestionCircleOutlined },
  ],
];
</script>

<style scoped lang="less"></style>
