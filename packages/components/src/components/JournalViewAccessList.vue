<template>
  <div class="access-list">
    <v-chip
      v-for="i in props.items"
      :key="i.id"
      color="primary"
      :title="`[${i.type}] ${i.name}`"
    >
      <v-icon v-if="i.type === 'USER'" :left="true">mdi-account</v-icon>
      <v-icon v-else :left="true">mdi-account-group</v-icon>
      <span>{{ i.name }}</span>
    </v-chip>
  </div>
</template>

<script setup lang="ts">
import type { AccessItem } from "../api/JournalViewApi";

interface Props {
  readonly items: AccessItem[];
}

const props = defineProps<Props>();
</script>

<style scoped lang="scss">
.access-list {
  margin-top: 4px;
  overflow-x: scroll;
  overflow-y: unset;
  white-space: nowrap;
}

.v-chip {
  margin-left: 4px;
  margin-bottom: 2px;
  max-width: 150px;
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
