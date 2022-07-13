<template>
  <v-dialog :model-value="show" @click:outside="emit('close')">
    <v-card>
      <v-card-item>
        <v-card-title>
          {{
            t(
              commandType === "CreateJournalCommand"
                ? "createJournal"
                : "updateJournal"
            )
          }}
        </v-card-title>
        <v-card-subtitle v-if="props.modelValue?.id">
          {{ props.modelValue.id }}
        </v-card-subtitle>
      </v-card-item>
      <v-card-text>
        <v-form @submit.prevent="update">
          <v-text-field
            v-model="command.name"
            :label="t('name')"
            variant="underlined"
            clearable
            :placeholder="modelValue?.name"
            :rules="baseRules"
          >
          </v-text-field>
          <v-textarea
            v-model="command.description"
            :label="t('description')"
            variant="underlined"
            clearable
            :placeholder="modelValue?.description"
            :rules="baseRules"
          >
          </v-textarea>
          <v-autocomplete
            v-model="command.tags"
            :items="items"
            :label="t('tags')"
            :rules="baseRules"
            chips
            closable-chips
            clearable
            multiple
            @update:search="searchTags"
          >
          </v-autocomplete>
          <v-text-field
            v-model="command.unit"
            :label="t('unit.currency')"
            variant="underlined"
            clearable
            :placeholder="modelValue?.unit"
            :rules="baseRules"
          >
          </v-text-field>

          <v-btn variant="text" color="primary" type="submit">
            {{ t("submit") }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { JournalModel } from "@white-rabbit/frontend-api";
import { computed, reactive, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import _ from "lodash";
import { SubmitEventPromise } from "vuetify";
import { useInject } from "../hooks";
import { ApiService, KEY_API_SERVICE } from "../services";
import { useAuthStore } from "../stores";
import { AccessItemValue, JournalCommand } from "@white-rabbit/types";

const { t } = useI18n();
const api = useInject<ApiService>(KEY_API_SERVICE);
const authStore = useAuthStore();

const props = defineProps<{
  readonly modelValue?: JournalModel;
  readonly show: boolean;
}>();
const emit = defineEmits<{
  (e: "close"): void;
}>();

const show = computed<boolean>(() => props.show);

const commandType = computed(() =>
  props.modelValue ? "UpdateJournalCommand" : "CreateJournalCommand"
);

const command = reactive<{
  name?: string;
  description?: string;
  tags?: string[];
  unit?: string;
  admins?: AccessItemValue[];
  members?: AccessItemValue[];
}>({});

watchEffect(() => {
  command.name = props.modelValue?.name;
  command.description = props.modelValue?.description;
  command.tags = props.modelValue?.tags;
  command.unit = props.modelValue?.unit;
  command.admins = props.modelValue?.admins;
  command.members = props.modelValue?.members;
});

const requiredRule = (v?: unknown) => !_.isEmpty(v) || t("error.requiredField");

const baseRules = computed(() => [
  ...(commandType.value === "CreateJournalCommand" ? [requiredRule] : []),
]);

const update = async (e: SubmitEventPromise) => {
  const errors = await e;
  if (!errors.valid) {
    return;
  }
  if (!authStore.user) {
    return;
  }
  if (
    props.modelValue &&
    command.name === props.modelValue.name &&
    command.description === props.modelValue.description &&
    command.tags === props.modelValue.tags &&
    command.unit === props.modelValue.unit &&
    command.admins === props.modelValue.admins &&
    command.members === props.modelValue.members
  ) {
    console.log("Ignore");
    emit("close");
    return;
  }

  await api.journal.handle(authStore.user.token, {
    ...command,
    type: commandType.value,
    targetId: props.modelValue?.id,
    admins:
      commandType.value === "CreateJournalCommand" && !command.admins
        ? []
        : command.admins,
    members:
      commandType.value === "CreateJournalCommand" && !command.members
        ? []
        : command.members,
  } as JournalCommand);
  emit("close");
};

const items = ref<string[]>([]);

const searchTags = (input: string) => {
  const value: string[] = [];
  const trimmed = input.trim();
  if (!_.isEmpty(trimmed)) {
    value.push(trimmed);
  }

  if (props.modelValue?.tags) {
    value.push(...props.modelValue.tags);
  }
  items.value = value;
};
</script>
