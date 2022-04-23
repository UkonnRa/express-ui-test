<template>
  <div class="access-list">
    <v-chip
      v-for="i in items"
      :key="i.id"
      color="primary"
      :title="`[${i.type.toString()}] ${i.name}`"
    >
      <v-icon v-if="i.type === TYPE_USER" :left="true">mdi-account</v-icon>
      <v-icon v-else :left="true">mdi-account-group</v-icon>
      <span>{{ i.name }}</span>
    </v-chip>
  </div>
</template>

<script setup lang="ts">
import type { AccessItemValue } from "@white-rabbit/type-bridge";
import { TYPE_USER } from "@white-rabbit/type-bridge";
import { computed } from "vue";

export interface AccessItem extends AccessItemValue {
  readonly name: string;
}

interface Props {
  readonly items: AccessItemValue[];
}

const props = defineProps<Props>();

const items = computed(() =>
  props.items.map((i) => ({ ...i, name: `ID: ${i.id}` }))
);
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
