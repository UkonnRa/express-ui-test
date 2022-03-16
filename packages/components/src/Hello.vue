<template>
  <button @click="onClick">Hello {{ times }} times</button>
</template>

<script setup lang="ts">
import { ref } from "vue";

const times = ref(2);
const onClick = () => {
  times.value += 1.2;
};
</script>

<style scoped></style>
