<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useAuth } from "../hooks";

const { signinCallback } = useAuth();
const router = useRouter();

useAsyncState(async () => {
  try {
    return signinCallback();
  } finally {
    await router.push({ name: "User" });
  }
}, null);
</script>

<template>
  <div>Redirecting...</div>
</template>
