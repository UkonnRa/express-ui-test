<template>
  <div class="d-flex mb-4 justify-space-between">
    <div class="d-flex">
      <h1 class="pr-2">{{ t("journals") }}</h1>
      <v-btn :prepend-icon="mdiPlus" color="primary" rounded="pill">
        {{ t("create") }}
      </v-btn>
    </div>
    <div class="d-flex">
      <v-select
        v-model="sortType"
        class="pr-2"
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
  <div class="main d-flex justify-space-between">
    <div v-if="journals" class="main__list d-flex flex-wrap align-start">
      <v-card
        v-for="journal in journals.items"
        :key="journal.cursor"
        class="ma-2"
      >
        <v-card-item>
          <v-card-title>
            <div class="d-flex">
              <v-btn
                class="mr-1"
                size="small"
                variant="plain"
                color="primary"
                :icon="journal.data.isFavorite ? mdiStar : mdiStarOutline"
              ></v-btn>
              <router-link
                :to="{ name: 'Journal', params: { id: journal.data.id } }"
                class="journal-card__link"
              >
                {{ journal.data.name }}
              </router-link>
            </div>
          </v-card-title>

          <div>
            <v-chip
              v-if="journal.data.archived"
              :prepend-icon="mdiArchive"
              color="error"
            >
              {{ t("archived") }}
            </v-chip>

            <v-chip
              v-if="journal.data.isAdmin"
              :prepend-icon="mdiShield"
              color="primary"
              class="ml-1"
            >
              {{ t("admin") }}
            </v-chip>
            <v-chip :prepend-icon="mdiBank" color="primary" class="ml-1">
              {{ journal.data.unit }}
            </v-chip>
            <template v-if="journal.data.tags">
              <v-chip
                v-for="tag in journal.data.tags"
                :key="tag"
                color="secondary"
                class="ma-1"
              >
                {{ tag }}
              </v-chip>
            </template>
          </div>
        </v-card-item>

        <v-card-text>
          <div>
            <h3>{{ t("description") }}</h3>
            <p>{{ journal.data.description }}</p>
          </div>
        </v-card-text>
        <v-card-actions v-if="!journal.data.archived">
          <v-btn variant="text" color="primary">{{ t("update") }}</v-btn>
          <v-btn variant="text" color="error">{{ t("delete") }}</v-btn>
        </v-card-actions>
      </v-card>
    </div>
    <div v-if="showFilterPanel" class="main__filter">
      <v-card variant="outlined">
        <v-card-title>{{ t("filterPanel") }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="query.$fullText"
              :label="t('keyword')"
              hide-details
              class="mb-4"
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
</template>

<script setup lang="ts">
import {
  mdiArchive,
  mdiBank,
  mdiFilter,
  mdiPlus,
  mdiShield,
  mdiSort,
  mdiStar,
  mdiStarOutline,
} from "@mdi/js";
import { useI18n } from "vue-i18n";
import { computed, reactive, ref, watchEffect } from "vue";
import { useInject } from "../hooks";
import { ApiService, KEY_API_SERVICE } from "../services";
import { useAuthStore } from "../stores";
import { JournalModel } from "@white-rabbit/frontend-api";
import { JournalQuery, Order, Page } from "@white-rabbit/types";
import AppUserAutoComplete from "../components/AppUserAutoComplete.vue";

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

const journals = ref<Page<JournalModel>>();
const showFilterPanel = ref(false);
const query = reactive<JournalQuery>({
  includeArchived: false,
});
watchEffect(async () => {
  if (authStore.user) {
    journals.value = await api.journal.findPage(authStore.user.token, {
      query,
      pagination: { size: 20 },
      sort: [sort.value],
    });
  }
});
</script>

<style lang="scss">
.main {
  &__list {
    .v-card {
      max-width: 350px;
    }
  }

  &__filter {
    min-width: 400px;
    max-width: 30%;
  }
}

.journal-card__link {
  color: rgb(var(--v-theme-primary));
  font-weight: bolder;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
