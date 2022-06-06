<script setup lang="ts">
import UserCard from "@/components/UserCard.vue";
</script>

<template>
  <suspense>
    <UserCard></UserCard>
    <template #fallback> Loading... </template>
  </suspense>
</template>
