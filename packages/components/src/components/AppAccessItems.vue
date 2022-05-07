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
    <template #dropdownRender="{ menuNode: menu }">
      <component :is="menu" />
      <a-divider style="margin: 4px 0" />
      <a-button
        type="link"
        block
        :disabled="searching"
        @mousedown="(e) => e.preventDefault()"
        @click="onLoadMoreOptionsClicked"
      >
        <sync-outlined :spin="searching" />
        Load More
      </a-button>
    </template>
    <template v-if="searching" #notFoundContent>
      <a-spin size="small" />
    </template>
    <template #option="{ label, value }">
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
          ID: {{ value }}
        </a-typography-text>
      </a-space>
    </template>
    <template #tagRender="{ closable, onClose, value, label }">
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
import {
  TeamOutlined,
  UserOutlined,
  SyncOutlined,
} from "@ant-design/icons-vue";
import type { SelectProps } from "ant-design-vue";
import { TYPE_USER, TYPE_GROUP } from "@white-rabbit/type-bridge";
import type { PageResult, AccessItemValue } from "@white-rabbit/type-bridge";
import { debounce } from "lodash-es";
import type { AccessItemApi } from "../api";
import { ACCESS_ITEM_API_KEY } from "../api";

const { t } = useI18n();

const props = defineProps<{
  modelValue?: AccessItemValue[];
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value?: AccessItemValue[]): void;
}>();

const accessItemApi = inject<AccessItemApi>(ACCESS_ITEM_API_KEY);
if (!accessItemApi) {
  throw new Error("accessItemApi not injected");
}

const selectedValues = computed({
  get: () =>
    props.modelValue?.map((v) => ({
      label: v.name,
      value: `${v.type.description}:${v.id}`,
    })),
  set: (val) => {
    const result = val
      ?.map<AccessItemValue | undefined>(({ label, value }) => {
        if (typeof value === "string") {
          const userPrefix = `${TYPE_USER.description}:`;
          const groupPrefix = `${TYPE_GROUP.description}:`;
          if (value.startsWith(userPrefix)) {
            return {
              type: TYPE_USER,
              id: value.substring(userPrefix.length),
              name: label,
            };
          } else if (value.startsWith(groupPrefix)) {
            return {
              type: TYPE_GROUP,
              id: value.substring(groupPrefix.length),
              name: label,
            };
          }
        }
      })
      ?.filter((v): v is AccessItemValue => v !== undefined);
    emit("update:modelValue", result);
  },
});

const pageItems = ref<PageResult<AccessItemValue>["pageItems"]>([]);

const options = computed<SelectProps["options"]>(() => {
  return pageItems.value
    ?.map((v) => v.data)
    ?.map((v) => ({ label: v.name, value: `${v.type.description}:${v.id}` }));
});

const searching = ref(false);

const searchKeyword = ref<string>("");

const onSearch = debounce(async (keyword: string) => {
  pageItems.value = [];
  if (keyword.length === 0) {
    searching.value = false;
    return;
  }
  searchKeyword.value = keyword;
  searching.value = true;
  pageItems.value = await accessItemApi
    .findAll({
      sort: [{ field: "name", order: "ASC" }],
      pagination: { size: 10, startFrom: "FIRST" },
      query: { type: "AccessItemQuery", keyword },
    })
    .then((result) => result.pageItems);
  searching.value = false;
}, 300);

const onLoadMoreOptionsClicked = async () => {
  searching.value = true;
  const items = await accessItemApi
    .findAll({
      sort: [{ field: "name", order: "ASC" }],
      pagination: {
        size: 10,
        startFrom: "FIRST",
        after: pageItems.value[pageItems.value.length - 1].cursor,
      },
      query: { type: "AccessItemQuery", keyword: searchKeyword.value },
    })
    .then((result) => result.pageItems);
  pageItems.value = [...pageItems.value, ...items];
  searching.value = false;
};
</script>

<style scoped lang="less"></style>
