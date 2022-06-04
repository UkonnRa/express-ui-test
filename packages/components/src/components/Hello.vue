<template>
  <div>Hello: {{ cnt }}</div>
  <v-btn @click="cnt = cnt + 1">Click</v-btn>
</template>

<script setup lang="ts">
import { ref } from "vue";

const cnt = ref(0);
</script>
