<template>
  <v-card>
    <v-card-title>Update Journal</v-card-title>
    <v-card-subtitle>ID: {{ props.journal.id }}</v-card-subtitle>
    <v-card-text>
      <v-form v-model="valid">
        <v-text-field
          v-model="journalName"
          label="Name"
          required
          hide-details="auto"
          class="mb-2"
        ></v-text-field>
        <v-textarea
          v-model="description"
          label="Description"
          required
          hide-details="auto"
          class="mb-2"
        >
        </v-textarea>
        <v-autocomplete
          v-model="admins"
          :items="adminsAccessItems"
          :loading="adminsLoading"
          color="primary"
          chips
          multiple
          item-text="name"
          item-value="id"
          :label="t('admins')"
          clearable
          hide-details="auto"
          class="mb-2"
          @update:search="adminsSearch"
        >
          <template #chip="data">
            <v-chip closable>
              {{ adminsIdName.get(data.selection.value) }}
            </v-chip>
          </template>
        </v-autocomplete>
        <v-autocomplete
          v-model="members"
          :items="membersAccessItems"
          :loading="membersLoading"
          color="primary"
          chips
          multiple
          item-text="name"
          item-value="id"
          :label="t('members')"
          clearable
          hide-details
          @update:search="membersSearch"
        >
          <template #chip="data">
            <v-chip closable>
              {{ membersIdName.get(data.selection.value) }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary">Save</v-btn>
      <v-btn>Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, type Ref, ref, type ComputedRef } from "vue";
import { v4 } from "uuid";
import { useI18n } from "vue-i18n";
import type { AccessItemValue, JournalValue } from "@white-rabbit/type-bridge";

interface Props {
  readonly journal: JournalValue;
}

const props = defineProps<Props>();
const { t } = useI18n();

const valid = ref(true);
const journalName = ref(props.journal.name);
const description = ref(props.journal.description);

const useAutoload = (
  defaultItems: AccessItemValue[]
): [
  Ref<string[]>,
  Ref<boolean>,
  Ref<string[]>,
  ComputedRef<Map<string, string>>,
  () => Promise<void>
] => {
  const items = ref(defaultItems.map((item) => item.id));
  const loading = ref(false);
  // error TS2322: Type '{ type: string; value: string; title: string; }[]' is not assignable to type 'SelectItem[]'
  const accessItems = ref<any[]>([]);
  const itemIdName = computed(
    () =>
      new Map([
        ...accessItems.value.map<[string, string]>(({ value, title }) => [
          value,
          title,
        ]),
        ...defaultItems.map<[string, string]>(({ id }) => [id, `ID: ${id}`]),
      ])
  );
  const searchAccessItems = async (): Promise<void> => {
    if (loading.value) return;
    loading.value = true;

    await new Promise((resolve) => setTimeout(resolve, 2000));
    accessItems.value = Array.from({ length: 10 }, (_, i) => {
      const id = v4();
      return {
        value: id,
        type: i % 2 === 0 ? "USER" : "GROUP",
        title: `New Item ${id.slice(0, (i % 3) * 10)}`,
      };
    });
    loading.value = false;
  };
  return [items, loading, accessItems, itemIdName, searchAccessItems];
};

const [admins, adminsLoading, adminsAccessItems, adminsIdName, adminsSearch] =
  useAutoload(props.journal.admins);
const [
  members,
  membersLoading,
  membersAccessItems,
  membersIdName,
  membersSearch,
] = useAutoload(props.journal.members);
</script>

<style scoped lang="scss">
.v-card {
  width: 80vw;
}
</style>
