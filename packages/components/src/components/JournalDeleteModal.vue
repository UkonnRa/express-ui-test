<template>
  <v-dialog :model-value="props.show" @click:outside="close(false)">
    <v-card>
      <v-card-item>
        <v-card-title>
          {{ t("deleteJournal") }}
        </v-card-title>
        <v-card-subtitle v-if="props.modelValue?.id">
          {{ props.modelValue.id }}
        </v-card-subtitle>
      </v-card-item>

      <v-card-text>
        <i18n-t keypath="deleteHint.content" tag="p">
          <template #type>
            <span class="font-bold">{{ t("journals") }}</span>
          </template>
          <template #name>
            <span class="font-bold">{{ props.modelValue.name }}</span>
          </template>
          <template #hintPermanent>
            <span class="font-bold text-error">
              {{ t("deleteHint.hint:permanent") }}
            </span>
          </template>
          <template #hintCascadeDelete>
            <span class="font-bold text-error">
              {{ t("deleteHint.hint:cascadeDelete") }}
            </span>
          </template>
        </i18n-t>
        <v-text-field
          v-model="name"
          class="mt-4"
          :label="t('name')"
          hide-details
          variant="underlined"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn :disabled="disabled" :color="color" @click="deleteItem">
          {{ t("delete") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { JournalModel } from "@white-rabbit/frontend-api";
import { useI18n } from "vue-i18n";
import { useInject } from "../hooks";
import { ApiService, KEY_API_SERVICE } from "../services";
import { useAuthStore } from "../stores";
import { computed, ref } from "vue";

const { t } = useI18n();
const api = useInject<ApiService>(KEY_API_SERVICE);
const authStore = useAuthStore();

const props = defineProps<{
  readonly modelValue: JournalModel;
  readonly show: boolean;
}>();
const emit = defineEmits<{
  (e: "close", anyUpdated: boolean): void;
}>();

const name = ref("");
const disabled = computed(() => name.value !== props.modelValue.name);
const color = computed(() => (disabled.value ? undefined : "error"));

const close = (anyUpdated: boolean) => {
  name.value = "";
  emit("close", anyUpdated);
};

const deleteItem = async () => {
  if (!authStore.user) {
    return;
  }
  await api.journal.handle(authStore.user.token, {
    type: "DeleteJournalCommand",
    targetId: props.modelValue.id,
  });
  close(true);
};
</script>
