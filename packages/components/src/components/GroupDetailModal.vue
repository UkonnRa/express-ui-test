<template>
  <v-dialog
    id="group-detail-modal"
    :model-value="show"
    @click:outside="emit('close', false)"
  >
    <v-card>
      <v-card-item>
        <v-card-title>{{ props.modelValue.name }}</v-card-title>
        <v-card-subtitle>{{ props.modelValue.id }}</v-card-subtitle>
      </v-card-item>
      <v-card-text class="flex flex-col gap-2">
        <div>
          <h4>{{ t("description") }}</h4>
          <p>{{ props.modelValue.description }}</p>
        </div>
        <div>
          <h4>{{ t("admins") }}</h4>
          <v-slide-group>
            <v-slide-group-item
              v-for="item in modelValue.admins"
              :key="item.id"
            >
              <v-chip class="mx-1">
                {{ item.name }}
              </v-chip>
            </v-slide-group-item>
          </v-slide-group>
        </div>
        <div>
          <h4>{{ t("members") }}</h4>
          <v-slide-group>
            <v-slide-group-item
              v-for="item in modelValue.members"
              :key="item.id"
            >
              <v-chip class="mx-1">
                {{ item.name }}
              </v-chip>
            </v-slide-group-item>
          </v-slide-group>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { GroupModel } from "@white-rabbit/frontend-api";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  readonly modelValue: GroupModel;
  readonly show: boolean;
}>();

const emit = defineEmits<{
  (e: "close", anyUpdated: boolean): void;
}>();

const show = computed<boolean>(() => props.show);
</script>
