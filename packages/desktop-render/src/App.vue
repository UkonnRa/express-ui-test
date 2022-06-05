<script setup lang="ts">
import Users from "@/components/Users.vue";
</script>

<template>
  <suspense>
    <Users></Users>
    <template #fallback> Loading... </template>
  </suspense>
</template>
