<template>
  <router-view v-if="route.meta.isRaw"></router-view>
  <AppScaffold v-else></AppScaffold>
</template>

<script setup lang="ts">
import { AppScaffold } from "@white-rabbit/components";
import { useRoute } from "vue-router";

const route = useRoute();
</script>
