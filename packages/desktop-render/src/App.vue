<script setup lang="ts">
import Users from "@/components/Users.vue";
</script>

<template>
  <suspense>
    <users></users>
    <template #fallback> Loading... </template>
  </suspense>
</template>
