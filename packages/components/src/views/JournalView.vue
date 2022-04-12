<template>
  <app-scaffold>
    <div class="mb-2">
      <v-row>
        <v-col cols="4">
          <v-text-field
            v-model="keyword"
            density="compact"
            label="Keywords"
            hide-details="auto"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-checkbox
            v-model="includeDeactivated"
            density="compact"
            label="Include Deactivated"
            hide-details="auto"
          ></v-checkbox>
        </v-col>
        <v-col cols="6" class="d-flex justify-end">
          <v-btn variant="text" prepend-icon="mdi-magnify">Search</v-btn>
        </v-col>
      </v-row>
      <template v-if="expandAdvancedSearch">
        <v-row>
          <v-col cols="4">
            <v-text-field
              v-model="startTime"
              density="compact"
              label="Start Time"
              hide-details="auto"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="endTime"
              density="compact"
              label="End Time"
              hide-details="auto"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="targetAccessItem"
              density="compact"
              label="Target Access Item"
              hide-details="auto"
            ></v-text-field>
          </v-col>
        </v-row>
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
              <h3 class="pb-2" :title="item.data.name">{{ item.data.name }}</h3>
              <h5>ID: {{ item.data.id }}</h5>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div>
              <p class="text-start">{{ item.data.description }}</p>
            </div>
            <div class="mb-2">
              <h3>Admins</h3>
              <journal-view-access-list
                :items="item.data.admins"
              ></journal-view-access-list>
            </div>
            <div>
              <h3>Members</h3>
              <journal-view-access-list
                :items="item.data.members"
              ></journal-view-access-list>
            </div>
            <div class="mt-1">
              <v-btn color="primary" variant="outlined" class="mr-1">
                {{ t("actions.visit") }}
              </v-btn>
              <v-btn
                color="secondary"
                variant="outlined"
                class="mr-1"
                @click="onUpdateJournal(item.data)"
              >
                {{ t("actions.update") }}
                <v-dialog v-model="updateJournalDialog">
                  <v-card v-if="!updateJournal"> Not Found </v-card>
                  <journal-view-update-dialog
                    v-else
                    :journal="updateJournal"
                  ></journal-view-update-dialog>
                </v-dialog>
              </v-btn>
              <v-btn color="warning" variant="outlined">
                {{ t("actions.delete") }}
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
import type { AccessItem, Journal, JournalViewApi } from "../api";
import { useAsyncState } from "@vueuse/core";
import {
  AppScaffold,
  JournalViewUpdateDialog,
  JournalViewAccessList,
} from "../components";
import { useI18n } from "vue-i18n";

type OrderBy = "Start Date ASC" | "Start Date DESC";

const expandAdvancedSearch = ref(false);

const keyword = ref("");
const includeDeactivated = ref(false);
const startTime = ref<string | null>(null);
const endTime = ref<string | null>(null);
const targetAccessItem = ref<AccessItem | null>(null);
const orderBy = ref<OrderBy>("Start Date DESC");
const onOrderByChanged = (data: OrderBy) => {
  console.log("onOrderByChanged: ", data);
};

const updateJournalDialog = ref(false);
const updateJournal = ref<Journal | null>(null);

const api = inject<JournalViewApi>("JournalViewApi");
if (!api) {
  throw new Error("JournalViewApi not found");
}

const { t } = useI18n();

const { state, isLoading } = useAsyncState(
  api.findAll(keyword.value, includeDeactivated.value),
  null
);

const onUpdateJournal = (journal: Journal) => {
  updateJournalDialog.value = true;
  updateJournal.value = journal;
};
</script>

<style scoped lang="scss">
.v-expansion-panel-title .title-content {
  white-space: nowrap;
  max-width: 95%;
  h3,
  h5 {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.journal-list-not-found {
  border: dashed gray;
  text-align: center;
  color: gray;
}
</style>
