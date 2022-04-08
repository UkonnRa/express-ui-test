<template>
  <app-scaffold>
    <v-row class="pb-4">
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
        <v-btn variant="plain" prepend-icon="mdi-magnify">Search</v-btn>
      </v-col>
    </v-row>
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
              :items="item.data.admins.items"
            ></journal-view-access-list>
          </div>
          <div>
            <h3>Members</h3>
            <journal-view-access-list
              :items="item.data.members.items"
            ></journal-view-access-list>
          </div>
          <div class="mt-1">
            <v-btn color="primary" variant="outlined" class="mr-1">Visit</v-btn>
            <v-btn
              color="secondary"
              variant="outlined"
              class="mr-1"
              @click="onUpdateJournal(item.data)"
              >Update</v-btn
            >
            <v-btn color="warning" variant="outlined">Delete</v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <div v-else class="journal-list-not-found">Not Found</div>
  </app-scaffold>
  <v-dialog v-model="updateJournalDialog">
    <v-card v-if="!updateJournal"> Not Found </v-card>
    <journal-view-update-dialog
      v-else
      :journal="updateJournal"
    ></journal-view-update-dialog>
  </v-dialog>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";
import type { Journal, JournalViewApi } from "../api/JournalViewApi";
import { useAsyncState } from "@vueuse/core";
import AppScaffold from "../components/AppScaffold.vue";
import JournalViewAccessList from "../components/JournalViewAccessList.vue";
import JournalViewUpdateDialog from "../components/JournalViewUpdateDialog.vue";

const keyword = ref("");
const includeDeactivated = ref(false);
const updateJournalDialog = ref(false);
const updateJournal = ref<Journal | null>(null);

const api = inject<JournalViewApi>("JournalViewApi");
if (!api) {
  throw new Error("JournalViewApi not found");
}

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
