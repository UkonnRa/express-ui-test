<template>
  <v-dialog :model-value="show" @click:outside="emit('close', false)">
    <v-card>
      <v-card-item>
        <v-card-title>
          {{
            t(
              commandType === "CreateGroupCommand"
                ? "createGroup"
                : "updateGroup"
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
          <AppAccessItemAutoComplete
            v-model="command.admins"
            :label="t('admins')"
            multiple
            :rules="baseRules"
            :type="AccessItemTypeValue.USER"
          ></AppAccessItemAutoComplete>
          <AppAccessItemAutoComplete
            v-model="command.members"
            :label="t('members')"
            multiple
            :rules="baseRules"
            :type="AccessItemTypeValue.USER"
          ></AppAccessItemAutoComplete>
          <v-btn variant="text" color="primary" type="submit">
            {{ t("submit") }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { GroupModel } from "@white-rabbit/frontend-api";
import { computed, reactive, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { SubmitEventPromise } from "vuetify";
import { useInject } from "../hooks";
import { ApiService, KEY_API_SERVICE } from "../services";
import { useAuthStore } from "../stores";
import {
  GroupCommand,
  AccessItemTypeValue,
  AccessItemValue,
} from "@white-rabbit/types";
import AppAccessItemAutoComplete from "./AppAccessItemAutoComplete.vue";

const { t } = useI18n();
const api = useInject<ApiService>(KEY_API_SERVICE);
const authStore = useAuthStore();

const props = defineProps<{
  readonly modelValue?: GroupModel;
  readonly show: boolean;
}>();
const emit = defineEmits<{
  (e: "close", anyUpdated: boolean): void;
}>();

const show = computed<boolean>(() => props.show);

const commandType = computed(() =>
  props.modelValue ? "UpdateGroupCommand" : "CreateGroupCommand"
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
  command.admins = props.modelValue?.admins?.map((item) => ({
    ...item,
    type: AccessItemTypeValue.USER,
  }));
  command.members = props.modelValue?.members?.map((item) => ({
    ...item,
    type: AccessItemTypeValue.USER,
  }));
});

const requiredRule = (v?: unknown) => !isEmpty(v) || t("error.requiredField");

const baseRules = computed(() => [
  ...(commandType.value === "CreateGroupCommand" ? [requiredRule] : []),
]);

const createIdSet = (items?: { id: string }[]) =>
  new Set(items?.map(({ id }) => id) ?? []);

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
    isEqual(
      createIdSet(command.admins),
      createIdSet(props.modelValue.admins)
    ) &&
    isEqual(createIdSet(command.members), createIdSet(props.modelValue.members))
  ) {
    emit("close", false);
    return;
  }

  await api.group.handle(authStore.user.token, {
    ...command,
    type: commandType.value,
    targetId: props.modelValue?.id,
    admins: command.admins?.map(({ id }) => id),
    members: command.members?.map(({ id }) => id),
  } as GroupCommand);
  emit("close", true);
};
</script>
