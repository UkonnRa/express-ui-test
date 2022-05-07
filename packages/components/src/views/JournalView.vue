<template>
  <app-default-layout
    :breadcrumbs="breadcrumbs"
    :side-menu-items="sideMenuItems"
  >
    <a-form
      :model="searchState"
      name="search"
      layout="inline"
      @finish="onSearchSubmitFinished"
    >
      <a-form-item :label="t('keyword')" name="keyword">
        <a-input v-model:value="searchState.keyword" />
      </a-form-item>
      <a-form-item :label="t('startDate')" name="startDate">
        <a-date-picker
          v-model:value="searchState.startDate"
          :disabled-date="disabledStartDate"
        />
      </a-form-item>
      <a-form-item :label="t('endDate')" name="endDate">
        <a-date-picker
          v-model:value="searchState.endDate"
          :disabled-date="disabledEndDate"
        />
      </a-form-item>
      <a-form-item :label="t('groupsOrUsers')" name="accessItems">
        <app-access-items v-model="searchState.accessItems"></app-access-items>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="text" @click="onSearchCleared">
            {{ t("clear") }}
          </a-button>
          <a-button type="primary" html-type="submit">{{
            t("search")
          }}</a-button>
          <a-button @click="() => onEditClicked('Create')">
            {{ t("createJournal") }}
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <a-list
      :loading="journalsLoading"
      :data-source="journals"
      item-layout="vertical"
      size="large"
    >
      <template #loadMore>
        <div
          v-if="!journalsLoading && journals.length > 0"
          class="action-loading"
        >
          <a-button type="text" @click="onLoadingMore">
            <template #icon>
              <sync-outlined />
            </template>
            {{ t("loadMore") }}
          </a-button>
        </div>
      </template>
      <template #renderItem="{ item }">
        <a-list-item :key="item.id">
          <template #actions>
            <a-button
              type="link"
              @click="() => onEditClicked('Update', item)"
              >{{ t("update") }}</a-button
            >
            <a-button type="link" danger>{{ t("delete") }}</a-button>
          </template>

          <a-list-item-meta>
            <template #description>
              <div>
                <strong> {{ t("dateRange") }} </strong>:
                <span>{{ formatDate(item.startDate) }}</span> -
                <span>{{ formatDate(item.endDate) }}</span>
              </div>
            </template>
            <template #title>
              <a-tag v-if="item.archived" color="error">
                <template #icon>
                  <inbox-outlined />
                </template>
                {{ t("archived") }}
              </a-tag>
              <router-link
                :to="{
                  name: ROUTE_JOURNAL_DETAIL_VIEW,
                  params: { id: item.id },
                }"
              >
                {{ item.name }}
              </router-link>
            </template>
          </a-list-item-meta>
          <div>
            <strong>{{ t("description") }}:</strong>
            <a-typography-paragraph
              :ellipsis="{ rows: 3 }"
              :content="item.description"
            />
          </div>
        </a-list-item>
      </template>
    </a-list>
  </app-default-layout>
  <journal-view-edit-modal
    v-model:visible="editState.visible"
    :type="editState.type"
    :value="editState.value"
  ></journal-view-edit-modal>
</template>

<script setup lang="ts">
import AppDefaultLayout from "../layouts/AppDefaultLayout.vue";
import AppAccessItems from "../components/AppAccessItems.vue";
import {
  AccountBookOutlined,
  TeamOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
  InboxOutlined,
} from "@ant-design/icons-vue";
import { ROUTE_JOURNALS_VIEW, ROUTE_JOURNAL_DETAIL_VIEW } from "../routes";
import type { AccessItemValue, JournalValue } from "@white-rabbit/type-bridge";
import dayjs, { type Dayjs } from "dayjs";
import JournalViewEditModal from "../components/JournalViewEditModal.vue";
import { TYPE_GROUP, TYPE_USER } from "@white-rabbit/type-bridge";

const { t } = useI18n();

const breadcrumbs = ref([{ name: "journals" }]);

const sideMenuItems = ref([
  [
    {
      name: "journals",
      route: ROUTE_JOURNALS_VIEW,
      icon: AccountBookOutlined,
    },
    { name: "groups", route: ROUTE_JOURNALS_VIEW, icon: TeamOutlined },
  ],
  [
    { name: "settings", route: ROUTE_JOURNALS_VIEW, icon: SettingOutlined },
    {
      name: "about",
      route: ROUTE_JOURNALS_VIEW,
      icon: QuestionCircleOutlined,
    },
  ],
]);

const searchState = reactive<{
  keyword?: string;
  startDate?: Dayjs;
  endDate?: Dayjs;
  accessItems?: AccessItemValue[];
}>({});

const disabledStartDate = (current: Dayjs) => {
  return (
    (searchState.endDate && current >= searchState.endDate.startOf("day")) ||
    false
  );
};

const disabledEndDate = (current: Dayjs) => {
  return (
    (searchState.startDate && current <= searchState.startDate.endOf("day")) ||
    false
  );
};

const onSearchCleared = () => {
  searchState.keyword = undefined;
  searchState.startDate = undefined;
  searchState.endDate = undefined;
  searchState.accessItems = undefined;
};

const onSearchSubmitFinished = async () => {
  if (Math.random() > 0.5) {
    await onLoadingMore();
  } else {
    journals.value = [];
  }
};

const journalsLoading = ref(false);
const journals = ref<JournalValue[]>([]);
const onLoadingMore = async () => {
  const len = journals.value.length;
  for (let i = 0; i < 10; i += 1) {
    const idx = len + 1 + i;
    journals.value.push({
      id: `Journal ID: ${idx}`,
      name: `Journal Name: ${idx}`,
      description: Array.from(
        { length: 50 },
        () => `Journal Description: ${idx}`
      ).join("\n"),
      startDate: dayjs(0).add(idx, "month").toDate(),
      endDate: dayjs(0)
        .add(idx + 2, "month")
        .toDate(),
      admins:
        idx % 3 === 0
          ? []
          : Array.from({ length: 10 }, (_, jdx) => {
              const type = jdx % 2 === 0 ? TYPE_USER : TYPE_GROUP;
              return {
                type,
                id: `${type.description}:Admin ID: ${jdx}`,
                name: `${type.description} Admin Name: ${jdx}`,
              };
            }),
      members:
        idx % 3 === 1
          ? []
          : Array.from({ length: 10 }, (_, jdx) => {
              const type = jdx % 2 === 0 ? TYPE_USER : TYPE_GROUP;
              return {
                type,
                id: `${type.description}:Member ID: ${jdx}`,
                name: `${type.description} Member Name: ${jdx}`,
              };
            }),
      archived: idx % 5 === 0,
    });
  }
};

const formatDate = (date?: Date): string => {
  if (date) {
    return dayjs(date).format("ll");
  }
  return t("nullValue");
};

const editState = reactive<{
  visible: boolean;
  type: "Update" | "Create";
  value?: JournalValue;
}>({
  visible: false,
  type: "Create",
});

const onEditClicked = (type: "Update" | "Create", value?: JournalValue) => {
  editState.visible = true;
  editState.type = type;
  editState.value = value;
};
</script>

<style scoped lang="less">
.action-loading {
  padding-top: 8px;
  text-align: center;
}

.app-access-items {
  min-width: 300px;
}
</style>
