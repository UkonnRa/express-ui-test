<script setup lang="ts">
import { Api, SYMBOL_API } from "@white-rabbit/components";
import { inject } from "vue";
import { useAsyncState } from "@vueuse/core";

const api = inject<Api>(SYMBOL_API);
if (!api) {
  throw new Error("API not found");
}

const { isReady, state } = useAsyncState(
  api.user.findOne({ query: { role: "OWNER" } }),
  null
);
</script>

<template>
  <div v-if="isReady">
    <div v-if="state">
      <div>User: {{ state.id }}</div>
      <div>Name: {{ state.name }}</div>
      <div>Role: {{ state.role }}</div>
      <div>AuthIds:</div>
      <div v-for="authId in state.authIds" :key="authId.value">
        <div>Provider: {{ authId.provider }}</div>
        <div>value: {{ authId.value }}</div>
      </div>
    </div>
    <div v-else>User Not Found</div>
  </div>
  <div v-else>Loading...</div>
</template>
