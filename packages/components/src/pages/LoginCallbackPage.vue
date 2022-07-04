<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores";
import { watchEffect } from "vue";

const authStore = useAuthStore();
const router = useRouter();

watchEffect(async () => {
  try {
    await authStore.signInCallback();
  } finally {
    await router.push({ path: "/" });
  }
});
</script>

<template>
  <div>Redirecting...</div>
</template>
