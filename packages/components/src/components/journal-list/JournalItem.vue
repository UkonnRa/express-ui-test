<template>
  <div>
    <p class="text-start">{{ props.item.description }}</p>
  </div>
  <div class="mb-2">
    <h3>Admins</h3>
    <access-list :items="props.item.admins"></access-list>
  </div>
  <div>
    <h3>Members</h3>
    <access-list :items="props.item.members"></access-list>
  </div>
  <div class="mt-1">
    <v-btn color="primary" variant="outlined" class="mr-1">Visit</v-btn>
    <v-btn color="secondary" variant="outlined" class="mr-1">Update</v-btn>
    <v-btn color="warning" variant="outlined">Delete</v-btn>
  </div>
</template>

<script setup lang="ts">
import AccessList from "./AccessList.vue";
import type { Props as ParentProps } from "./index.vue";

interface Props {
  item: ParentProps;
}

const props = defineProps<Props>();
</script>

<style scoped></style>
