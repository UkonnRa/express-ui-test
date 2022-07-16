<template>
  <div class="flex justify-between pb-2">
    <div class="flex gap-1">
      <h1>{{ t("groups") }}</h1>
      <v-btn
        :prepend-icon="mdiPlus"
        color="primary"
        rounded="pill"
        @click="onCreateClicked"
      >
        {{ t("create") }}
      </v-btn>
    </div>
    <div class="flex gap-1">
      <v-select
        v-model="sortType"
        variant="outlined"
        density="compact"
        color="primary"
        :label="t('sort.title')"
        :items="sortOptions"
        :hide-details="true"
        :prepend-icon="mdiSort"
      ></v-select>
      <v-btn
        :prepend-icon="mdiFilter"
        color="primary"
        variant="outlined"
        rounded="pill"
        @click="showFilterPanel = !showFilterPanel"
      >
        {{ t("filter") }}
      </v-btn>
    </div>
  </div>
  <div class="flex gap-4 justify-between">
    <div class="flex-1 flex flex-col gap-2">
      <div
        v-if="groups"
        class="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      >
        <v-card
          v-for="group in groups"
          :key="group.id"
          class="max-w-md self-start"
        >
          <v-card-item>
            <v-card-title class="mb-2 text-primary">
              {{ group.name }}
            </v-card-title>
          </v-card-item>

          <v-card-text class="flex flex-col gap-2">
            <div class="flex flex-col gap-1">
              <h3>{{ t("description") }}</h3>
              <p>{{ group.description }}</p>
            </div>
            <div class="flex flex-col gap-1">
              <h3>{{ t("admins") }}</h3>
              <AppAccessItemList
                :model-value="getItems(group.admins)"
                readonly
              ></AppAccessItemList>
            </div>
            <div class="flex flex-col gap-1">
              <h3>{{ t("members") }}</h3>
              <AppAccessItemList
                :model-value="getItems(group.members)"
                readonly
              ></AppAccessItemList>
            </div>
          </v-card-text>
          <v-card-actions v-if="group.isWriteable">
            <v-btn
              variant="text"
              color="primary"
              @click="onUpdateClicked(group)"
            >
              {{ t("update") }}
            </v-btn>
            <v-btn variant="text" color="error" @click="onDeleteClicked(group)">
              {{ t("delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
      <div class="flex justify-center">
        <v-btn
          :disabled="!pageInfo?.hasNextPage"
          :loading="isLoadingMore"
          variant="text"
          @click="loadMore"
        >
          {{ t("loadMore") }}
        </v-btn>
      </div>
    </div>

    <div>
      <v-card v-if="showFilterPanel" variant="outlined" class="min-w-max">
        <v-card-title>{{ t("filterPanel") }}</v-card-title>
        <v-card-text>
          <v-form class="flex flex-col gap-1">
            <v-text-field
              v-model="query.$fullText"
              :label="t('keyword')"
              hide-details
              variant="underlined"
              clearable
            ></v-text-field>
            <AppAccessItemAutoComplete
              v-model="queryAdmins"
              :label="t('admin')"
              hide-details
              :type="AccessItemTypeValue.USER"
            ></AppAccessItemAutoComplete>
            <AppAccessItemAutoComplete
              v-model="queryMembers"
              :label="t('member')"
              hide-details
              :type="AccessItemTypeValue.USER"
            ></AppAccessItemAutoComplete>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </div>

  <GroupDeleteModal
    v-if="selected"
    v-model="selected"
    :show="showDeleteModal"
    @close="onDeleteModalClosed"
  ></GroupDeleteModal>
  <GroupEditModal
    v-model="selected"
    :show="showEditModal"
    @close="onEditModalClosed"
  ></GroupEditModal>
</template>

<script setup lang="ts">
import { mdiFilter, mdiPlus, mdiSort } from "@mdi/js";
import { useI18n } from "vue-i18n";
import { computed, reactive, ref, watchEffect } from "vue";
import { useInject } from "../hooks";
import { ApiService, KEY_API_SERVICE } from "../services";
import { useAuthStore } from "../stores";
import { GroupModel, UserModel } from "@white-rabbit/frontend-api";
import {
  AccessItemValue,
  GroupQuery,
  Order,
  PageInfo,
  AccessItemTypeValue,
} from "@white-rabbit/types";
import {
  AppAccessItemList,
  AppAccessItemAutoComplete,
  GroupDeleteModal,
  GroupEditModal,
} from "../components";

const { t } = useI18n();

type SortType = "name:asc" | "name:desc";
const sortOptions = computed<Array<{ title: string; value: SortType }>>(() => [
  { title: t("sort.field:name:asc"), value: "name:asc" },
  { title: t("sort.field:name:desc"), value: "name:desc" },
]);

const sortType = ref<SortType>("name:asc");
const sort = computed(() => {
  switch (sortType.value) {
    case "name:asc":
      return { field: "name", order: Order.ASC };
    case "name:desc":
      return { field: "name", order: Order.DESC };
    default:
      throw new Error(`No such sortType: ${sortType.value}`);
  }
});

const api = useInject<ApiService>(KEY_API_SERVICE);
const authStore = useAuthStore();

const groups = ref<Array<GroupModel>>();
const getItems = (
  items: Array<Pick<UserModel, "id" | "name">>
): AccessItemValue[] =>
  items.map(({ id, name }) => ({ id, name, type: AccessItemTypeValue.USER }));

const pageInfo = ref<PageInfo>();
const isLoadingMore = ref(false);
const loadMore = async () => {
  if (pageInfo.value && authStore.user && pageInfo.value.hasNextPage) {
    isLoadingMore.value = true;

    const page = await api.group.findPage(authStore.user.token, {
      query,
      pagination: { size: 10, after: pageInfo.value.endCursor },
      sort: [sort.value],
    });
    groups.value?.push(...page.items.map((item) => item.data));
    pageInfo.value = page.pageInfo;

    isLoadingMore.value = false;
  }
};

const selected = ref<GroupModel>();
const showEditModal = ref<boolean>(false);
const showDeleteModal = ref<boolean>(false);

const onCreateClicked = () => {
  selected.value = undefined;
  showEditModal.value = true;
};
const onUpdateClicked = (entity: GroupModel) => {
  selected.value = entity;
  showEditModal.value = true;
};
const onEditModalClosed = async (anyUpdated: boolean) => {
  showEditModal.value = false;
  if (anyUpdated) {
    await search();
  }
};

const onDeleteClicked = (journal: GroupModel) => {
  selected.value = journal;
  showDeleteModal.value = true;
};
const onDeleteModalClosed = async (anyUpdated: boolean) => {
  showDeleteModal.value = false;
  if (anyUpdated) {
    await search();
  }
};

const showFilterPanel = ref(false);
const queryAdmins = ref<AccessItemValue>();
const queryMembers = ref<AccessItemValue>();
const query = reactive<GroupQuery>({});
const search = async () => {
  if (authStore.user) {
    const page = await api.group.findPage(authStore.user.token, {
      query: {
        ...query,
        admins: queryAdmins.value?.id || undefined,
        members: queryMembers.value?.id || undefined,
      },
      pagination: { size: 10 },
      sort: [sort.value],
    });
    groups.value = page.items.map((item) => item.data);
    pageInfo.value = page.pageInfo;
  }
};
watchEffect(() => search());
</script>
