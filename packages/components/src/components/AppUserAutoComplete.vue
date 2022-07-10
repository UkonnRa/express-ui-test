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
    return-object
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

const { t } = useI18n();
const api = useInject<ApiService>(KEY_API_SERVICE);
const authStore = useAuthStore();

const propValues = defineProps<{
  readonly modelValue?: string;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", modelValue?: string): void;
}>();

const user = computed<UserModel | undefined>({
  get: () => {
    return propValues.modelValue
      ? users.value[propValues.modelValue]
      : undefined;
  },
  set: (value?: UserModel) => {
    const id = value?.id;
    emit("update:modelValue", id);
  },
});

const users = ref<Record<string, UserModel>>({});
const items = computed(() =>
  Object.values(users.value).sort((a, b) => a.name.localeCompare(b.name))
);

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

    users.value = {
      ...users.value,
      ...Object.fromEntries(page.items.map(({ data }) => [data.id, data])),
    };
  }
};
</script>
