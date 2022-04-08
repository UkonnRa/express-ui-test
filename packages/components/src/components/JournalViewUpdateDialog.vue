<template>
  <v-card>
    <v-card-title>Update Journal</v-card-title>
    <v-card-subtitle>ID: {{ props.journal.id }}</v-card-subtitle>
    <v-card-text>
      <v-form v-model="valid">
        <v-text-field v-model="name" label="Name" required></v-text-field>
        <v-textarea v-model="description" label="Description" required>
        </v-textarea>
        <v-autocomplete
          v-model="admins"
          :items="accessItems"
          :loading="isLoading"
          color="primary"
          chips
          multiple
          item-text="name"
          item-value="id"
          label="Admins"
          clearable
          @update:search="searchAccessItems"
        >
          <template #chip="data">
            <v-chip closable>
              {{ itemIdName.get(data.selection.value) }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Journal } from "../api/JournalViewApi";
import { computed, ref } from "vue";
import { v4 } from "uuid";

interface Props {
  readonly journal: Journal;
}

const props = defineProps<Props>();

const valid = ref(true);
const name = ref(props.journal.name);
const description = ref(props.journal.description);
const admins = ref(props.journal.admins.items.map((item) => item.id));

const isLoading = ref(false);
// error TS2322: Type '{ type: string; value: string; title: string; }[]' is not assignable to type 'SelectItem[]'
const accessItems = ref<any[]>([]);
const searchAccessItems = async (): Promise<void> => {
  if (isLoading.value) return;
  isLoading.value = true;

  await new Promise((resolve) => setTimeout(resolve, 2000));
  accessItems.value = Array.from({ length: 10 }, (_, i) => {
    const id = v4();
    return {
      value: id,
      type: i % 2 === 0 ? "USER" : "GROUP",
      title: `New Item ${id.slice(0, (i % 3) * 10)}`,
    };
  });
  isLoading.value = false;
};
const itemIdName = computed(
  () =>
    new Map([
      ...accessItems.value.map<[string, string]>(({ value, title }) => [
        value,
        title,
      ]),
      ...props.journal.admins.items.map<[string, string]>(({ id, name }) => [
        id,
        name,
      ]),
    ])
);
</script>

<style scoped lang="scss">
.v-card {
  width: 80vw;
}
</style>
