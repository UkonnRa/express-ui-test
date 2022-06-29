<template>
  <v-app>
    <v-navigation-drawer app> </v-navigation-drawer>

    <v-app-bar app>
      <v-btn @click="toggleDark()">{{ isDark ? "Dark" : "Light" }}</v-btn>
      <v-btn
        :icon="mdiAccount"
        color="primary"
        @click="router.push({ name: 'User' })"
      >
      </v-btn>
      <v-btn
        :icon="mdiTable"
        color="secondary"
        @click="router.push({ name: 'AgGridTest' })"
      >
      </v-btn>
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
import { mdiAccount, mdiTable } from "@mdi/js";
import { useRouter } from "vue-router";

const { isDark, toggleDark } = useDark();
const router = useRouter();
</script>
