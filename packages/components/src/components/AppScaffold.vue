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
      <v-list-item title="Username" subtitle="email@email.com">
        <template #prepend>
          <v-list-item-avatar>
            <v-avatar color="primary" class="mr-2">
              <span>Us</span>
            </v-avatar>
          </v-list-item-avatar>
        </template>
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
          title="About"
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
        title="Toggle dark/light theme"
        @click="theme = theme === 'light' ? 'dark' : 'light'"
      ></v-btn>
      <v-btn variant="text" icon="mdi-translate"></v-btn>
    </v-app-bar>
    <v-main>
      <v-container fluid class="h">
        <slot></slot>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from "vue";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Props {}

const rail = ref(false);
const theme = ref<"light" | "dark">("light");
</script>

<style scoped lang="scss">
.v-main {
  min-height: 100vh;
}
</style>
