<template>
  <v-btn color="secondary" @click="onClick">World {{ times }} times</v-btn>
</template>

<script setup lang="ts">
import { ref } from "vue";

const times = ref(3);
const onClick = () => {
  times.value *= 2;
};
</script>

<style scoped></style>
