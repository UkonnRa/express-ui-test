<template>
  <app-scaffold>
    <div class="mb-2">
      <div class="d-flex mb-2">
        <v-text-field
          v-model="keyword"
          density="compact"
          :label="t('keyword')"
          hide-details="auto"
          class="mr-2"
        ></v-text-field>
        <v-tooltip anchor="bottom">
          <span>{{ t("includeArchived.title") }}</span>
          <template #activator="{ props }">
            <div v-bind="props">
              <v-switch
                v-model="includeDeactivated"
                density="compact"
                :label="t('includeArchived.label')"
                color="primary"
                hide-details="auto"
              >
              </v-switch>
            </div>
          </template>
        </v-tooltip>
        <v-spacer></v-spacer>
        <v-btn variant="text" prepend-icon="mdi-magnify">Search</v-btn>
      </div>
      <template v-if="expandAdvancedSearch">
        <div class="d-flex">
          <v-text-field
            v-model="startTime"
            type="date"
            density="compact"
            label="Start Time"
            hide-details="auto"
            class="mr-2"
            :lang="locale"
          ></v-text-field>
          <v-text-field
            v-model="endTime"
            type="date"
            density="compact"
            label="End Time"
            hide-details="auto"
            class="mr-2"
            :lang="locale"
          ></v-text-field>
          <v-text-field
            v-model="targetAccessItem"
            density="compact"
            label="Target Access Item"
            hide-details="auto"
          ></v-text-field>
        </div>
        <v-btn
          block
          variant="plain"
          class="mt-2"
          prepend-icon="mdi-chevron-up"
          @click="expandAdvancedSearch = false"
        >
          Collapse
        </v-btn>
      </template>
      <template v-else>
        <v-btn
          block
          variant="plain"
          prepend-icon="mdi-chevron-down"
          @click="expandAdvancedSearch = true"
        >
          Expand
        </v-btn>
      </template>
    </div>
    <v-divider></v-divider>
    <div class="mt-2">
      <div id="journals-actions" class="d-flex">
        <v-btn prepend-icon="mdi-plus" variant="text" color="primary">
          Add
        </v-btn>
        <v-spacer></v-spacer>
        <v-select
          v-model="orderBy"
          class="flex-grow-0"
          density="compact"
          :items="['Start Date ASC', 'Start Date DESC']"
          label="Order By"
          hide-details
          variant="plain"
          @update:model-value="onOrderByChanged"
        ></v-select>
      </div>

      <v-progress-linear v-if="isLoading" indeterminate></v-progress-linear>
      <v-expansion-panels v-else-if="state && state.pageItems.length > 0">
        <v-expansion-panel v-for="item of state.pageItems" :key="item.cursor">
          <v-expansion-panel-title>
            <div class="title-content d-flex flex-column align-start">
              <div class="title-content-name d-flex w-100">
                <v-chip
                  v-if="item.data.archived"
                  color="error"
                  size="x-small"
                  class="mr-2"
                >
                  {{ t("archived") }}
                </v-chip>
                <h3 class="pb-2" :title="item.data.name">
                  {{ item.data.name }}
                </h3>
              </div>
              <h5 class="pb-2">{{ item.data.id }}</h5>
              <div class="d-flex">
                <div>
                  <span class="font-italic">
                    {{
                      item.data.startDate?.toLocaleDateString(
                        locale,
                        FORMAT_OPTION
                      )
                    }}
                  </span>
                  -
                  <span class="font-italic">
                    {{
                      item.data.endDate?.toLocaleDateString(
                        locale,
                        FORMAT_OPTION
                      )
                    }}
                  </span>
                </div>
              </div>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div>
              <h4>Description</h4>
              <p class="text-start">{{ item.data.description }}</p>
            </div>
            <div class="mb-2">
              <h4>Admins</h4>
              <journal-view-access-list
                :items="item.data.admins"
              ></journal-view-access-list>
            </div>
            <div>
              <h4>Members</h4>
              <journal-view-access-list
                :items="item.data.members"
              ></journal-view-access-list>
            </div>
            <div class="mt-1">
              <v-btn color="primary" variant="outlined" class="mr-1">
                {{ t("visit") }}
              </v-btn>
              <v-btn
                color="secondary"
                variant="outlined"
                class="mr-1"
                @click="onUpdateJournal(item.data)"
              >
                {{ t("update") }}
                <v-dialog v-model="updateJournalDialog">
                  <v-card v-if="!updateJournal"> Not Found </v-card>
                  <journal-view-update-dialog
                    v-else
                    :journal="updateJournal"
                  ></journal-view-update-dialog>
                </v-dialog>
              </v-btn>
              <v-btn color="warning" variant="outlined">
                {{ t("delete") }}
              </v-btn>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <div v-else class="journal-list-not-found">Not Found</div>
    </div>
  </app-scaffold>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";
import { useAsyncState } from "@vueuse/core";
import {
  AppScaffold,
  JournalViewUpdateDialog,
  JournalViewAccessList,
} from "../components";
import { useI18n } from "vue-i18n";
import type { AccessItemValue, JournalValue } from "@white-rabbit/type-bridge";
import type { JournalApi } from "../api";
import { JOURNAL_API_KEY } from "../api";

const FORMAT_OPTION: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

type OrderBy = "Start Date ASC" | "Start Date DESC";

const expandAdvancedSearch = ref(false);

const keyword = ref("");
const includeDeactivated = ref(false);
const startTime = ref<string>();
const endTime = ref<string>();
const targetAccessItem = ref<AccessItemValue>();
const orderBy = ref<OrderBy>("Start Date DESC");
const onOrderByChanged = (data: OrderBy) => {
  console.log("onOrderByChanged: ", data);
};

const updateJournalDialog = ref(false);
const updateJournal = ref<JournalValue>();

const api = inject<JournalApi>(JOURNAL_API_KEY);
if (!api) {
  throw new Error("JournalViewApi not found");
}

const { t, locale } = useI18n();

const { state, isLoading } = useAsyncState(
  api.findAll(keyword.value, includeDeactivated.value),
  null
);

const onUpdateJournal = (journal: JournalValue) => {
  updateJournalDialog.value = true;
  updateJournal.value = journal;
};
</script>

<style scoped lang="scss">
.v-expansion-panel-title .title-content {
  white-space: nowrap;
  max-width: 95%;
  .title-content-name h3,
  h5 {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .title-content-name .v-chip {
    flex: none;
  }
}

.journal-list-not-found {
  border: dashed gray;
  text-align: center;
  color: gray;
}

.v-text-field {
  max-width: 300px;
}
</style>
