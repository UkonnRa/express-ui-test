<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-title>
        <div class="d-flex">
          <AppLogo></AppLogo>
          <v-btn class="ml-1" @click="router.push({ name: 'Journals' })">
            {{ t("journal.title") }}
          </v-btn>
          <v-btn class="ml-1" @click="router.push({ name: 'Groups' })">
            {{ t("group.title") }}
          </v-btn>
        </div>
      </v-app-bar-title>
      <template #append>
        <div class="d-flex align-center">
          <v-tooltip location="bottom">
            {{ t("theme.description") }}
            <template #activator="{ props }">
              <v-switch
                v-model="isDark"
                :prepend-icon="mdiThemeLightDark"
                hide-details
                inset
                v-bind="props"
                @click="toggleDark()"
              >
              </v-switch>
            </template>
          </v-tooltip>

          <v-btn :prepend-icon="mdiTranslate" class="ml-1" color="primary">
            {{ getLocaleName(locale) }}
            <v-menu activator="parent">
              <v-list>
                <v-list-item
                  v-for="item in availableLocales"
                  :key="item"
                  :value="item"
                  @click="locale = item"
                >
                  <v-list-item-title>
                    {{ getLocaleName(item) }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn>
        </div>
      </template>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer app> </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { useDark } from "../hooks";
import { useRouter } from "vue-router";
import AppLogo from "./AppLogo.vue";
import { Locale, useI18n } from "vue-i18n";
import { watchEffect } from "vue";
import { mdiTranslate, mdiThemeLightDark } from "@mdi/js";

const { isDark, toggleDark } = useDark();
const router = useRouter();
const { t, locale, availableLocales } = useI18n();

const getLocaleName = (value: Locale) => {
  switch (value) {
    case "en":
      return "English";
    case "zh-Hans":
      return "简体中文";
    default:
      return undefined;
  }
};

watchEffect(() => {
  let fontFamily = "Roboto";
  if (locale.value === "zh-Hans") {
    fontFamily = "Noto Sans SC";
  }

  document.body.style.fontFamily = fontFamily;
});
</script>
