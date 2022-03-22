<template>
  <Scaffold></Scaffold>
  <button @click="loadBusinessLogic">Load business logic</button>
  <code>
    <pre>{{ result }}</pre>
  </code>
</template>

<script setup lang="ts">
import { Scaffold } from "@white-rabbit/components";
import { ref } from "vue";

const result = ref("");

const loadBusinessLogic = () =>
  window.ipcRenderer
    .invoke("business-logic")
    .then((r: string) => (result.value = r));
</script>

<style scoped></style>
