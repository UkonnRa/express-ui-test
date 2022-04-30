<template>
  <a-layout class="app-layout">
    <a-layout-header>
      <div class="app-logo">
        White<span class="app-logo--colored">Rabbit</span>
      </div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider v-model:collapsed="collapsed" collapsible theme="light">
        <a-menu mode="inline">
          <template v-for="(itemGroup, idx) in props.sideMenuItems">
            <a-menu-item
              v-for="item of itemGroup"
              :key="item.name"
              @click="router.push({ name: item.route })"
            >
              <component :is="item.icon"></component>
              <span>{{ item.name }}</span>
            </a-menu-item>
            <a-divider v-if="idx < itemGroup.length - 1" :key="idx"></a-divider>
          </template>
        </a-menu>
      </a-layout-sider>
      <a-layout-content>
        <a-breadcrumb>
          <a-breadcrumb-item
            v-for="breadcrumb in props.breadcrumbs"
            :key="breadcrumb.name"
          >
            <router-link
              v-if="breadcrumb.route"
              :to="{ name: breadcrumb.route }"
            >
              {{ breadcrumb.name }}
            </router-link>
            <span v-else>{{ breadcrumb.name }}</span>
          </a-breadcrumb-item>
        </a-breadcrumb>
        <div class="app-content">
          <slot />
        </div>
        <a-layout-footer>
          Ukonn Ra ©{{ year }} Supported by Ant Design Vue
        </a-layout-footer>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import type { FunctionalComponent } from "vue";

const props = defineProps<{
  breadcrumbs: { name: string; route?: symbol }[];
  sideMenuItems: { name: string; route: symbol; icon: FunctionalComponent }[][];
}>();
const collapsed = ref(false);
const year = ref(new Date().getFullYear());
const router = useRouter();
</script>

<style scoped lang="less">
@import "ant-design-vue/dist/antd.variable.less";

.app-layout {
  min-height: 100vh;
}

.ant-layout-header .app-logo {
  color: white;
  font-style: italic;
  font-size: xx-large;
  font-weight: bolder;
  user-select: none;

  &--colored {
    background-color: @primary-color;
    color: @text-color;
    border-radius: 8px;
    padding: 0 2px;
    margin-left: 2px;
  }
}

.ant-layout-content {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  .app-content {
    flex: auto;
  }
  .ant-breadcrumb {
    flex: none;
    padding-bottom: 8px;
    font-size: large;
    font-weight: bold;
  }

  .ant-layout-footer {
    flex: none;
    text-align: center;
  }
}
</style>
