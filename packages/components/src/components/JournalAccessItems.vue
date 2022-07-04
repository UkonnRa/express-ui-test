<template>
  <v-autocomplete
    v-model="accessItems"
    :label="t('includeGroupOrUser')"
    item-title="name"
    item-value="id"
    hide-details
    variant="underlined"
    clearable
    chips
    closable-chips
    multiple
    @update:search="search"
  >
    <template #chip="{ props, item }">
      <v-chip :prepend-icon="getIcon(item)" v-bind="props">
        {{ getTitle(item) }}
      </v-chip>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import {
  AccessItemValue,
  AccessItemTypeValue,
} from "@white-rabbit/frontend-api";
import { mdiAccountGroup, mdiAccount } from "@mdi/js";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useInject } from "../hooks";
import { ApiService, KEY_API_SERVICE } from "../services";

const { t } = useI18n();
const api = useInject<ApiService>(KEY_API_SERVICE);

type SelectItem = {
  readonly raw: AccessItemValue;
  readonly title: string;
  readonly value: string;
};

const propValues = defineProps<{
  readonly modelValue: AccessItemValue[];
}>();
const emit = defineEmits<{
  (e: "update:modelValue", modelValue: AccessItemValue[]): void;
}>();
const accessItems = computed({
  get: () => propValues.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const getTitle = (item: unknown) => (item as SelectItem).title;
const getIcon = (item: unknown) =>
  (item as SelectItem).raw.type === AccessItemTypeValue.GROUP
    ? mdiAccountGroup
    : mdiAccount;

const search = async (input: string): Promise<void> => {
  console.log("Search: ", input);
  console.log("Api: ", api);
};
</script>
