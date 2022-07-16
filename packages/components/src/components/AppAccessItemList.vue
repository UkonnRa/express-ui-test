<template>
  <v-slide-group v-if="propValues.readonly">
    <v-slide-group-item v-for="item in modelValue" :key="item.id">
      <v-chip :prepend-icon="getIcon(item)" class="mx-1">
        {{ item.name }}
      </v-chip>
    </v-slide-group-item>
  </v-slide-group>
</template>

<script setup lang="ts">
import { AccessItemTypeValue, AccessItemValue } from "@white-rabbit/types";
import { mdiAccount, mdiAccountGroup } from "@mdi/js";

const propValues = defineProps<{
  readonly modelValue: AccessItemValue[];
  readonly readonly: boolean;
}>();

const getIcon = (item: AccessItemValue) =>
  item.type === AccessItemTypeValue.USER ? mdiAccount : mdiAccountGroup;
</script>
