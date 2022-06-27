<script setup lang="ts">
import { useAuthStore } from "../stores/auth";
import { useAsyncState } from "@vueuse/core";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

useAsyncState(async () => {
  try {
    return authStore.signInCallback();
  } finally {
    await router.push({ name: "User" });
  }
}, null);
</script>

<template>
  <div>Redirecting...</div>
</template>
