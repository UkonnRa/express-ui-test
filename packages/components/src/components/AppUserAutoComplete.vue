<template>
  <v-autocomplete
    v-model="user"
    :label="t('includeUser')"
    :items="items"
    item-title="name"
    item-value="id"
    hide-details
    variant="underlined"
    clearable
    chips
    @update:search="search"
  >
  </v-autocomplete>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useInject } from "../hooks";
import { ApiService, KEY_API_SERVICE } from "../services";
import { UserModel } from "@white-rabbit/frontend-api";
import { useAuthStore } from "../stores";
import { Order } from "@white-rabbit/types";
import _ from "lodash";

const { t } = useI18n();
const api = useInject<ApiService>(KEY_API_SERVICE);
const authStore = useAuthStore();

const propValues = defineProps<{
  readonly modelValue?: string;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", modelValue?: string): void;
}>();

const user = computed({
  get: () => propValues.modelValue,
  set: (value) =>
    emit("update:modelValue", _.isEmpty(value) ? undefined : value),
});

const items = ref<UserModel[]>([]);

const search = async (input: string): Promise<void> => {
  if (authStore.user) {
    const page = await api.user.findPage(authStore.user.token, {
      query: {
        name: {
          $fullText: input,
        },
      },
      pagination: { size: 20 },
      sort: [{ field: "name", order: Order.ASC }],
    });
    items.value = page.items.map(({ data }) => data);
  }
};
</script>
