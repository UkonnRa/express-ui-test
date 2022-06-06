<script setup lang="ts">
import { ref } from "vue";

const cnt = ref(0);
</script>

<template>
  <v-btn @click="cnt = cnt + 1">User</v-btn>
</template>
