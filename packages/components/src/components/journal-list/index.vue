<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      <div class="d-flex flex-column align-start">
        <h3 class="mb-2">{{ props.name }}</h3>
        <h5>ID: {{ props.id }}</h5>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <journal-item :item="props"></journal-item>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script setup lang="ts">
import JournalItem from "./JournalItem.vue";

export interface AccessItem {
  readonly type: "USER" | "GROUP";
  readonly id: string;
  readonly name: string;
}

export interface Props {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly admins: Array<AccessItem>;
  readonly members: Array<AccessItem>;
}

const props = defineProps<Props>();
</script>

<style scoped lang="scss">
.v-expansion-panel-title {
  span:hover {
    text-decoration-line: underline;
    cursor: pointer;
  }
}
</style>
