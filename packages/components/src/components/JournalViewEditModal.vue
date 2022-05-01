<template>
  <a-modal
    :visible="props.visible"
    :title="title"
    :cancel-text="t('cancel')"
    :ok-text="t('submit')"
    @ok="onUpdated"
    @cancel="onCancelled"
  >
    <a-form :label-col="{ span: 4 }" :model="value">
      <a-form-item
        :label="t('name')"
        name="name"
        :rules="[
          { required: true, message: t('messageRequireField', [t('name')]) },
        ]"
      >
        <a-input v-model:value="value.name" />
      </a-form-item>
      <a-form-item :label="t('description')" name="description">
        <a-textarea v-model:value="value.description" :rows="4" />
      </a-form-item>
      <a-form-item :label="t('startDate')" name="startDate">
        <a-date-picker
          v-model:value="value.startDate"
          :disabled-date="disabledStartDate"
        />
      </a-form-item>
      <a-form-item :label="t('endDate')" name="endDate">
        <a-date-picker
          v-model:value="value.endDate"
          :disabled-date="disabledEndDate"
        />
      </a-form-item>
      <a-form-item :label="t('admins')" name="admins">
        <app-access-items v-model="value.admins"></app-access-items>
      </a-form-item>
      <a-form-item :label="t('members')" name="members">
        <app-access-items v-model="value.members"></app-access-items>
      </a-form-item>
      <a-form-item :label="t('archived')" name="archived">
        <a-switch v-model:checked="value.archived" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import AppAccessItems from "./AppAccessItems.vue";
import type { AccessItemValue, JournalValue } from "@white-rabbit/type-bridge";
import dayjs, { Dayjs } from "dayjs";

const props = defineProps<{
  readonly visible: boolean;
  readonly type: "Update" | "Create";
  readonly value?: JournalValue;
}>();

const { t } = useI18n();

const emit = defineEmits<{
  (event: "update:visible", visible: boolean): void;
}>();

const title = computed(() =>
  props.type === "Update" ? t("updateJournal") : t("createJournal")
);

const onCancelled = () => emit("update:visible", false);
const onUpdated = () => emit("update:visible", false);

const value = reactive<{
  name?: string;
  description?: string;
  startDate?: Dayjs;
  endDate?: Dayjs;
  admins?: AccessItemValue[];
  members?: AccessItemValue[];
  archived?: boolean;
}>({
  ...props.value,
  startDate: props.value?.startDate ? dayjs(props.value.startDate) : undefined,
  endDate: props.value?.endDate ? dayjs(props.value.endDate) : undefined,
});

watchEffect(() => {
  value.name = props.value?.name;
  value.description = props.value?.description;
  value.startDate = props.value?.startDate
    ? dayjs(props.value.startDate)
    : undefined;
  value.endDate = props.value?.endDate ? dayjs(props.value.endDate) : undefined;
  value.admins = props.value?.admins;
  value.members = props.value?.members;
  value.archived = props.value?.archived;
});

const disabledStartDate = (current: Dayjs) => {
  return (value.endDate && current >= value.endDate.startOf("day")) || false;
};

const disabledEndDate = (current: Dayjs) => {
  return (value.startDate && current <= value.startDate.endOf("day")) || false;
};
</script>

<style scoped lang="less">
.app-access-items {
  min-width: 400px;
}
</style>
