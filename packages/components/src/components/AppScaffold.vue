<template>
  <v-app :theme="theme">
    <v-navigation-drawer :rail="rail" :permanent="true">
      <v-list-item>
        <v-list-item-title class="d-flex flex-grow-1">
          <h1 class="font-italic">WhiteRabbit</h1>
        </v-list-item-title>
        <template #append>
          <v-list-item-avatar>
            <v-btn
              size="small"
              variant="text"
              :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
              @click.stop="rail = !rail"
            ></v-btn>
          </v-list-item-avatar>
        </template>
      </v-list-item>
      <v-list-item>
        <v-list-item-avatar>
          <v-avatar color="primary">
            <span>Us</span>
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-header class="ml-2">
          <v-list-item-title>Username</v-list-item-title>
          <v-list-item-subtitle>email@email.com</v-list-item-subtitle>
        </v-list-item-header>
      </v-list-item>
      <v-divider></v-divider>
      <v-list>
        <v-list-item
          prepend-icon="mdi-notebook"
          title="Journals"
          value="journals"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account-group"
          title="Groups"
          value="groups"
        ></v-list-item>
        <v-divider></v-divider>
        <v-list-item
          prepend-icon="mdi-cog"
          title="Settings"
          value="settings"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-information"
          :title="t('about')"
          value="about"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar>
      <v-toolbar-title>Journals</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        icon="mdi-theme-light-dark"
        :title="t('toggleTheme')"
        @click="theme = theme === 'light' ? 'dark' : 'light'"
      ></v-btn>
      <v-menu>
        <template #activator="{ props }">
          <v-btn variant="text" prepend-icon="mdi-translate" v-bind="props">
            {{ getLocaleName(locale) }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="[key, value] in availableLocaleValues"
            :key="key"
            :value="value"
            @click="locale = key"
          >
            <v-list-item-title>{{ value }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-container fluid class="h">
        <slot></slot>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Props {}

const rail = ref(false);
const theme = ref<"light" | "dark">("light");
const { locale, availableLocales, t } = useI18n();
const getLocaleName = (lang: string): string => {
  switch (lang) {
    case "en-US":
      return "English";
    case "zh-CN":
      return "中文";
    default:
      throw Error(`Language[${locale}] not supported`);
  }
};
const availableLocaleValues = computed(() => {
  return availableLocales.map((v) => [v, getLocaleName(v)]);
});
</script>

<style scoped lang="scss">
.v-main {
  min-height: 100vh;
}
</style>

<style lang="scss">
.v-main *,
.v-overlay-container * {
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(
      var(--v-theme-on-background),
      var(--v-medium-emphasis-opacity)
    );
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: padding-box; // <== make the border work
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(
      var(--v-theme-on-background),
      var(--v-high-emphasis-opacity)
    );
    border: 0;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }
}
</style>
