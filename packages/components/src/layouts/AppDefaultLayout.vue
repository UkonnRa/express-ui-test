<template>
  <a-config-provider :locale="antdLocale">
    <a-layout class="app-layout">
      <a-layout-header class="app-header">
        <div class="app-header--logo">
          White<span class="app-header--logo--colored">Rabbit</span>
        </div>
        <div class="app-header--spacer"></div>
        <div class="app-header--action">
          <a-dropdown :trigger="['click']">
            <a @click.prevent>
              <translation-outlined />
              {{ localeName(locale) }}
              <down-outlined></down-outlined>
            </a>
            <template #overlay>
              <a-menu placement="bottomRight" @click="onLocaleSelected">
                <a-menu-item v-for="item in availableLocales" :key="item">
                  <span>{{ localeName(item) }}</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
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
                <span>{{ t(item.name) }}</span>
              </a-menu-item>
              <a-divider
                v-if="idx < itemGroup.length - 1"
                :key="idx"
              ></a-divider>
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
                {{ t(breadcrumb.name) }}
              </router-link>
              <span v-else>{{ t(breadcrumb.name) }}</span>
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
  </a-config-provider>
</template>

<script setup lang="ts">
import { DownOutlined, TranslationOutlined } from "@ant-design/icons-vue";
import type { FunctionalComponent } from "vue";
import type { MenuProps } from "ant-design-vue";
import dayjs from "dayjs";
import enUS from "ant-design-vue/es/locale/en_US";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { LOCALE_EN_US, LOCALE_ZH_CN } from "../plugins";

const { t, locale, availableLocales } = useI18n();
const props = defineProps<{
  breadcrumbs: { name: string; route?: symbol }[];
  sideMenuItems: { name: string; route: symbol; icon: FunctionalComponent }[][];
}>();
const collapsed = ref(false);
const year = ref(new Date().getFullYear());
const router = useRouter();
const antdLocale = computed(() => {
  if (locale.value === LOCALE_ZH_CN) {
    return zhCN;
  } else {
    return enUS;
  }
});

const onLocaleSelected: MenuProps["onClick"] = (e) => {
  const selected = String(e.key);
  locale.value = selected;
  dayjs.locale(selected.toLowerCase());
};

const localeName = (value: string) => {
  if (value === LOCALE_ZH_CN) {
    return "简体中文";
  } else if (value === LOCALE_EN_US) {
    return "English";
  } else {
    return value;
  }
};
</script>

<style scoped lang="less">
@import "ant-design-vue/dist/antd.variable.less";

.app-layout {
  min-height: 100vh;
}

.app-header {
  display: flex;

  &--logo {
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
  &--spacer {
    flex: auto;
  }
  &--action {
  }
}

.ant-layout-content {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  .app-content {
    flex: auto;
    background: white;
    padding: 16px 24px;
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
