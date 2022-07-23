<template>
  <el-dialog v-model="show" custom-class="w-11/12 md:w-2/3 lg:w-1/2">
    <template #header>
      {{ t("deleteGroup") }}
    </template>

    <template #footer>
      <el-button type="danger" :disabled="disabled" @click="deleteItem">
        {{ t("delete") }}
      </el-button>
    </template>

    <i18n-t keypath="deleteHint.content" tag="p">
      <template #type>
        <span class="font-bold">{{ t("groups") }}</span>
      </template>
      <template #name>
        <span class="font-bold">{{ props.modelValue.name }}</span>
      </template>
      <template #hintPermanent>
        <span class="font-bold text-error">
          {{ t("deleteHint.hint:permanent") }}
        </span>
      </template>
      <template #hintCascadeDelete>
        <span class="font-bold text-error">
          {{ t("deleteHint.hint:cascadeDelete") }}
        </span>
      </template>
    </i18n-t>
    <el-input v-model="name" class="mt-4" :label="t('name')" />
  </el-dialog>
</template>

<script setup lang="ts">
import { GroupModel } from "@white-rabbit/frontend-api";
import { useI18n } from "vue-i18n";
import { useInject } from "../hooks";
import { ApiService, KEY_API_SERVICE } from "../services";
import { useAuthStore } from "../stores";
import { computed, ref } from "vue";

const { t } = useI18n();
const api = useInject<ApiService>(KEY_API_SERVICE);
const authStore = useAuthStore();

const props = defineProps<{
  readonly modelValue: GroupModel;
  readonly show: boolean;
}>();
const emit = defineEmits<{
  (e: "close", anyUpdated: boolean): void;
}>();
const show = computed({
  get: () => props.show,
  set: (value: boolean) => {
    if (!value) {
      name.value = "";
      emit("close", entityUpdated.value);
      entityUpdated.value = false;
    }
  },
});

const name = ref("");
const disabled = computed(() => name.value !== props.modelValue.name);
const entityUpdated = ref(false);

const deleteItem = async () => {
  if (!authStore.user) {
    return;
  }
  await api.group.handle(authStore.user.token, {
    type: "DeleteGroupCommand",
    targetId: props.modelValue.id,
  });
  entityUpdated.value = true;
  show.value = false;
};
</script>
