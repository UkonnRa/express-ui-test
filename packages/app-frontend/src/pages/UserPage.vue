<script setup lang="ts">
import { watchEffect } from "vue";
import { useAsyncState } from "@vueuse/core";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const { isReady, state, error } = useAsyncState(async () => {
  return authStore.currentUser();
}, null);

watchEffect(() => error.value != null && console.error(error.value));
</script>

<template>
  <div v-if="isReady">
    <div v-if="state">
      <div>ID Token: {{ state.id_token }}</div>
      <div>Access Token: {{ state.access_token }}</div>
      <div>Scope: {{ state.scopes }}</div>
    </div>
    <div v-else>User Not Found</div>
  </div>
  <div v-else>Loading...</div>
</template>
