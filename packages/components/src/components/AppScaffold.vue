<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-title>
        <div class="flex gap-1">
          <AppLogo></AppLogo>
          <v-btn color="primary" @click="router.push({ name: 'Journals' })">
            {{ t("journals") }}
          </v-btn>
          <v-btn color="primary" @click="router.push({ name: 'Groups' })">
            {{ t("groups") }}
          </v-btn>
          <v-tooltip location="bottom">
            {{ t("search.description") }}
            <template #activator="{ props }">
              <v-btn :icon="mdiMagnify" color="primary" v-bind="props"> </v-btn>
            </template>
          </v-tooltip>
        </div>
      </v-app-bar-title>
      <template #append>
        <div class="flex items-center gap-1">
          <v-tooltip location="bottom">
            {{ t("theme.description") }}
            <template #activator="{ props }">
              <v-switch
                v-model="isDark"
                color="primary"
                :prepend-icon="mdiThemeLightDark"
                hide-details
                inset
                v-bind="props"
                @click="toggleDark()"
              >
              </v-switch>
            </template>
          </v-tooltip>
          <v-btn :prepend-icon="mdiTranslate" color="primary">
            {{ LOCALE_NAMES[locale] }}
            <v-menu activator="parent">
              <v-list>
                <v-list-item
                  v-for="(name, code) in LOCALE_NAMES"
                  :key="code"
                  @click="locale = code"
                >
                  <v-list-item-title>
                    {{ name }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn>
          <v-btn icon>
            <v-avatar color="primary">
              <v-icon v-if="!avatarInfo" :icon="mdiAccount"> </v-icon>
              <v-img
                v-else-if="avatarInfo.picture"
                :src="avatarInfo.picture"
                :alt="avatarInfo.name"
              ></v-img>
              <span v-else>{{ avatarInfo.name.substring(0, 2) }}</span>
            </v-avatar>
          </v-btn>
        </div>
      </template>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer elevation="4" app>
      <div class="w-full text-center">
        {{ new Date().getFullYear() }} — <strong>Ukonn Ra</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { useDark } from "../hooks";
import { useRouter } from "vue-router";
import AppLogo from "./AppLogo.vue";
import { useI18n } from "vue-i18n";
import { computed, watchEffect } from "vue";
import {
  mdiTranslate,
  mdiThemeLightDark,
  mdiMagnify,
  mdiAccount,
} from "@mdi/js";
import { useAuthStore } from "../stores";
import { User } from "oidc-client-ts";
import { AuthUser } from "../services";
import { LOCALE_NAMES } from "../plugins";

const { isDark, toggleDark } = useDark();
const router = useRouter();
const { t, locale } = useI18n();

const authStore = useAuthStore();
const avatarInfo = computed<{ picture?: string; name: string } | null>(() => {
  if (!authStore.user) {
    return null;
  }
  const { token, user } = authStore.user as AuthUser<User>;
  if (!user) {
    return null;
  }
  return { picture: token.profile.picture, name: user.name };
});

watchEffect(() => {
  let fontFamily = "Roboto";
  if (locale.value === "zhHans") {
    fontFamily = "Noto Sans SC";
  }

  document.body.style.fontFamily = fontFamily;
});
</script>
