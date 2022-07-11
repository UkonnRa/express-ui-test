<template>
  <div class="flex justify-between pb-2">
    <div class="flex gap-1">
      <h1>{{ t("journals") }}</h1>
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
        v-if="journals"
        class="grid gap-2 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4"
      >
        <v-card
          v-for="journal in journals"
          :key="journal.id"
          class="max-w-md self-start"
        >
          <v-card-item>
            <v-card-title class="mb-2">
              <router-link
                class="text-primary no-underline hover:underline"
                :to="{ name: 'Journal', params: { id: journal.id } }"
              >
                {{ journal.name }}
              </router-link>
            </v-card-title>

            <div class="inline-flex flex-wrap gap-1">
              <v-chip
                v-if="journal.archived"
                :prepend-icon="mdiArchive"
                color="error"
              >
                {{ t("archived") }}
              </v-chip>

              <v-chip
                v-if="journal.isAdmin"
                :prepend-icon="mdiShield"
                color="primary"
              >
                {{ t("admin") }}
              </v-chip>
              <v-chip :prepend-icon="mdiBank" color="primary">
                {{ journal.unit }}
              </v-chip>
              <template v-if="journal.tags">
                <v-chip
                  v-for="tag in journal.tags"
                  :key="tag"
                  color="secondary"
                >
                  {{ tag }}
                </v-chip>
              </template>
            </div>
          </v-card-item>

          <v-card-text class="flex flex-col gap-2">
            <div class="flex flex-col gap-1">
              <h3>{{ t("description") }}</h3>
              <p>{{ journal.description }}</p>
            </div>
            <div class="flex flex-col gap-1">
              <h3>{{ t("admins") }}</h3>
              <AppAccessItemList
                v-model="journal.admins"
                readonly
              ></AppAccessItemList>
            </div>
            <div class="flex flex-col gap-1">
              <h3>{{ t("members") }}</h3>
              <AppAccessItemList
                v-model="journal.members"
                readonly
              ></AppAccessItemList>
            </div>
          </v-card-text>
          <v-card-actions v-if="!journal.archived">
            <v-btn
              variant="text"
              color="primary"
              @click="onUpdateClicked(journal)"
            >
              {{ t("update") }}
            </v-btn>
            <v-btn variant="text" color="error">{{ t("delete") }}</v-btn>
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
            <v-text-field
              v-model="query.unit"
              :label="t('unit.currency')"
              hide-details
              variant="underlined"
              clearable
            ></v-text-field>
            <v-switch
              v-model="query.includeArchived"
              :label="t('includeArchived')"
              hide-details
              color="primary"
            ></v-switch>
            <AppUserAutoComplete
              v-model="query.$containingUser"
            ></AppUserAutoComplete>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </div>

  <JournalEditModal
    v-model="selectedJournal"
    :show="showEditModal"
    @close="onEditModalClosed"
  ></JournalEditModal>
</template>

<script setup lang="ts">
import {
  mdiArchive,
  mdiBank,
  mdiFilter,
  mdiPlus,
  mdiShield,
  mdiSort,
} from "@mdi/js";
import { useI18n } from "vue-i18n";
import { computed, reactive, ref, watchEffect } from "vue";
import { useInject } from "../hooks";
import { ApiService, KEY_API_SERVICE } from "../services";
import { useAuthStore } from "../stores";
import { JournalModel } from "@white-rabbit/frontend-api";
import { JournalQuery, Order, PageInfo } from "@white-rabbit/types";
import {
  AppUserAutoComplete,
  AppAccessItemList,
  JournalEditModal,
} from "../components";

const { t } = useI18n();

type SortType = "name:asc" | "name:desc" | "startDate";
const sortOptions = computed<Array<{ title: string; value: SortType }>>(() => [
  { title: t("sort.field:name:asc"), value: "name:asc" },
  { title: t("sort.field:name:desc"), value: "name:desc" },
  { title: t("sort.field:startDate"), value: "startDate" },
]);
const sortType = ref<SortType>("name:asc");
const sort = computed(() => {
  switch (sortType.value) {
    case "startDate":
      return { field: "startDate", order: Order.DESC };
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

const journals = ref<Array<JournalModel>>();
const pageInfo = ref<PageInfo>();
const isLoadingMore = ref(false);
const loadMore = async () => {
  if (pageInfo.value && authStore.user && pageInfo.value.hasNextPage) {
    isLoadingMore.value = true;

    const page = await api.journal.findPage(authStore.user.token, {
      query,
      pagination: { size: 10, after: pageInfo.value.endCursor },
      sort: [sort.value],
    });
    journals.value?.push(...page.items.map((item) => item.data));
    pageInfo.value = page.pageInfo;

    isLoadingMore.value = false;
  }
};

const selectedJournal = ref<JournalModel>();
const showEditModal = ref<boolean>(false);
const onCreateClicked = () => {
  selectedJournal.value = undefined;
  showEditModal.value = true;
};
const onUpdateClicked = (journal: JournalModel) => {
  selectedJournal.value = journal;
  showEditModal.value = true;
};
const onEditModalClosed = async () => {
  showEditModal.value = false;
  await search();
};

const showFilterPanel = ref(false);
const query = reactive<JournalQuery>({
  includeArchived: false,
});
const search = async () => {
  if (authStore.user) {
    const page = await api.journal.findPage(authStore.user.token, {
      query,
      pagination: { size: 10 },
      sort: [sort.value],
    });
    journals.value = page.items.map((item) => item.data);
    pageInfo.value = page.pageInfo;
  }
};
watchEffect(() => search());
</script>

<style lang="scss">
.journal-card__link {
  color: rgb(var(--v-theme-primary));
  font-weight: bolder;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
