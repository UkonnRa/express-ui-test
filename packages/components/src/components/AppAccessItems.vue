<template>
  <div v-if="props.readonly">
    <div v-if="selectedValues?.length <= 0">No data</div>
    <a-space v-else>
      <a-tag v-for="item in selectedValues" :key="item.value">
        {{ item.label }}
      </a-tag>
    </a-space>
  </div>
  <a-select
    v-else
    v-model:value="selectedValues"
    :max-tag-count="2"
    :max-tag-text-length="50"
    class="app-access-items"
    mode="multiple"
    label-in-value
    :placeholder="t('searchUsersOrGroups')"
    :options="options"
    :not-found-content="searching ? undefined : null"
    :filter-option="false"
    allow-clear
    auto-clear-search-value
    @search="onSearch"
  >
    <template v-if="searching" #notFoundContent>
      <a-spin size="small" />
    </template>
    <template #option="{ value, label }">
      <a-space direction="vertical">
        <a-typography-text strong>
          <a-space>
            <team-outlined
              v-if="value.startsWith(TYPE_GROUP.description)"
            ></team-outlined>
            <user-outlined v-else></user-outlined>
            <span>{{ label }}</span>
          </a-space>
        </a-typography-text>
        <a-typography-text type="secondary">
          ID: {{ value.substring(value.indexOf(":") + 1) }}
        </a-typography-text>
      </a-space>
    </template>
    <template #tagRender="{ label, value, closable, onClose }">
      <a-tag :closable="closable" @close="onClose">
        <a-space>
          <team-outlined
            v-if="value.startsWith(TYPE_GROUP.description)"
          ></team-outlined>
          <user-outlined v-else></user-outlined>
          <span>{{ label }}</span>
        </a-space>
      </a-tag>
    </template>
  </a-select>
</template>

<script setup lang="ts">
import { TeamOutlined, UserOutlined } from "@ant-design/icons-vue";

import type { AccessItemValue } from "@white-rabbit/type-bridge";
import { TYPE_USER, TYPE_GROUP } from "@white-rabbit/type-bridge";
import { debounce } from "lodash-es";

const { t } = useI18n();

const props = defineProps<{
  modelValue?: AccessItemValue[];
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value?: AccessItemValue[]): void;
}>();

interface SelectItemProps {
  readonly value: string;
  readonly label: string;
}

const selectedValues = computed<SelectItemProps[] | undefined>({
  get: () =>
    props.modelValue?.map((v) => ({
      label: `Name of ${v.id}`,
      value: `${v.type.description}:${v.id}`,
    })),
  set: (val) => {
    const result = val
      ?.map(({ value }) => {
        const userPrefix = `${TYPE_USER.description}:`;
        const groupPrefix = `${TYPE_GROUP.description}:`;
        if (value.startsWith(userPrefix)) {
          const id = value.substring(userPrefix.length);
          return { type: TYPE_USER, id };
        } else if (value.startsWith(groupPrefix)) {
          const id = value.substring(groupPrefix.length);
          return { type: TYPE_GROUP, id };
        }
      })
      ?.filter((v): v is AccessItemValue => v != null);
    emit("update:modelValue", result);
  },
});

const options = ref<SelectItemProps[]>([]);

const searching = ref(false);

const onSearch = debounce(async (keyword: string) => {
  options.value = [];
  if (keyword.length === 0) {
    searching.value = false;
    return;
  }
  searching.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  options.value = Array.from({ length: 10 }, (_, idx) => {
    const type: symbol = idx % 2 === 0 ? TYPE_USER : TYPE_GROUP;
    return {
      value: `${type.description}:ID: ${idx}`,
      label: Array.from(
        { length: 10 },
        () => `${type.description} Name: ${idx}`
      ).join(""),
    };
  });
  searching.value = false;
}, 300);
</script>

<style scoped lang="less"></style>
