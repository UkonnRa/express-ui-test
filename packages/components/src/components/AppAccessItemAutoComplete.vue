<template>
  <v-autocomplete
    v-model="selected"
    :items="items"
    item-title="name"
    item-value="id"
    variant="underlined"
    clearable
    chips
    return-object
    :label="propValues.label"
    :hide-details="propValues.hideDetails"
    :closable-chips="propValues.multiple"
    :multiple="propValues.multiple"
    :rules="propValues.rules"
    @update:search="search"
  >
    <template #chip="{ props, item }">
      <v-chip
        v-bind="props"
        :prepend-icon="itemIcon(item)"
        :text="castItem(item).title"
      ></v-chip>
    </template>
    <template #item="{ props, item }">
      <v-list-item
        v-bind="props"
        :prepend-icon="itemIcon(item)"
        :title="castItem(item).title"
        :subtitle="castItem(item).value"
      ></v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { VAutocomplete } from "vuetify/components";
import { mdiAccount, mdiAccountGroup } from "@mdi/js";
import { computed, ref } from "vue";
import { useInject } from "../hooks";
import { ApiService, KEY_API_SERVICE } from "../services";
import { useAuthStore } from "../stores";
import {
  AccessItemTypeValue,
  AccessItemValue,
  Order,
} from "@white-rabbit/types";
import isEmpty from "lodash/isEmpty";

type SelectItem = {
  readonly value: string;
  readonly title: string;
  readonly raw: AccessItemValue;
};

type ModelValue = AccessItemValue | AccessItemValue[];

const api = useInject<ApiService>(KEY_API_SERVICE);
const authStore = useAuthStore();

const propValues = defineProps<{
  readonly modelValue?: ModelValue;
  readonly type?: AccessItemTypeValue;

  readonly label: string;
  readonly multiple?: boolean;
  readonly hideDetails?: boolean;
  readonly rules?: Array<(item?: unknown) => boolean | string>;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", modelValue?: ModelValue): void;
}>();

const selected = computed<AccessItemValue[]>({
  get: () => propValues.modelValue as AccessItemValue[],
  set: (value?: ModelValue) => {
    emit("update:modelValue", isEmpty(value) ? undefined : value);
  },
});

const items = ref<AccessItemValue[]>([]);

const search = async (input: string): Promise<void> => {
  if (authStore.user) {
    items.value = await api.accessItem.findAll(authStore.user.token, {
      query: {
        $fullText: input,
        type: propValues.type,
      },
      sort: [
        {
          field: "name",
          order: Order.ASC,
        },
      ],
      size: 10,
    });
  }
};

const itemIcon = (item: unknown) =>
  castItem(item).raw.type === AccessItemTypeValue.GROUP
    ? mdiAccountGroup
    : mdiAccount;

const castItem = (item: unknown) => item as SelectItem;
</script>
