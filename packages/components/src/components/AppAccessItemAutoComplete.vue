<template>
  <v-autocomplete
    v-model="user"
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
import { useInject } from "../hooks";
import { ApiService, KEY_API_SERVICE } from "../services";
import { useAuthStore } from "../stores";
import { AccessItemValue } from "@white-rabbit/types";

const api = useInject<ApiService>(KEY_API_SERVICE);
const authStore = useAuthStore();

const propValues = defineProps<{
  readonly modelValue?: AccessItemValue;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", modelValue?: AccessItemValue): void;
}>();

const user = computed<AccessItemValue | undefined>({
  get: () => {
    return propValues.modelValue;
  },
  set: (value?: AccessItemValue) => {
    emit("update:modelValue", value);
  },
});

const items = ref<AccessItemValue[]>([]);

const search = async (input: string): Promise<void> => {
  if (authStore.user) {
    items.value = await api.accessItem.findAll(authStore.user.token, {
      query: {
        $fullText: input,
      },
    });
  }
};
</script>
