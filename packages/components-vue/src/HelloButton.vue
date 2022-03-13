<template>
  <button @click="doClick">Click {{ times }} times</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const times = ref(1);
const doClick = () => {
  console.log('doClick');
  times.value++;
};
</script>

<style scoped></style>
