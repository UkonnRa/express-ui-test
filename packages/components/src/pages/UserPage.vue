<template>
  <div v-if="authStore.user">
    <pre><code>{{JSON.stringify(authStore.user, null, 2)}}</code></pre>
  </div>
  <div v-else>AuthUser Not Found</div>
  <div>===</div>
  <div v-if="user">
    <div>ID: {{ user.id }}</div>
    <div>createdAt: {{ user.createdAt }}</div>
    <div>updatedAt: {{ user.updatedAt }}</div>
    <div>name: {{ user.name }}</div>
    <div>role: {{ user.role }}</div>
    <div>authIds: {{ user.authIds }}</div>
  </div>
  <div v-else>User Not Found</div>
  <div>===</div>
  <div v-if="group">
    <div>ID: {{ group.id }}</div>
    <div>createdAt: {{ group.createdAt }}</div>
    <div>updatedAt: {{ group.updatedAt }}</div>
    <div>name: {{ group.name }}</div>
    <div>description: {{ group.description }}</div>
    <div>admins: {{ group.admins }}</div>
    <div>members: {{ group.members }}</div>
  </div>
  <div v-else>Group Not Found</div>
  <div>===</div>
  <div v-if="journal">
    <div>ID: {{ journal.id }}</div>
    <div>createdAt: {{ journal.createdAt }}</div>
    <div>updatedAt: {{ journal.updatedAt }}</div>
    <div>name: {{ journal.name }}</div>
    <div>description: {{ journal.description }}</div>
    <div>tags: {{ journal.tags }}</div>
    <div>unit: {{ journal.unit }}</div>
    <div>archived: {{ journal.archived }}</div>
    <div>admins: {{ journal.admins }}</div>
    <div>members: {{ journal.members }}</div>
  </div>
  <div v-else>Journal Not Found</div>
  <div>===</div>
  <div v-if="account">
    <div>ID: {{ account.id }}</div>
    <div>createdAt: {{ account.createdAt }}</div>
    <div>updatedAt: {{ account.updatedAt }}</div>
    <div>name: {{ account.name }}</div>
    <div>description: {{ account.description }}</div>
    <div>type: {{ account.type }}</div>
    <div>strategy: {{ account.strategy }}</div>
    <div>unit: {{ account.unit }}</div>
    <div>archived: {{ account.archived }}</div>
  </div>
  <div v-else>Account Not Found</div>
  <div>===</div>
  <div v-if="record">
    <div>ID: {{ record.id }}</div>
    <div>createdAt: {{ record.createdAt }}</div>
    <div>updatedAt: {{ record.updatedAt }}</div>
    <div>journal: {{ record.journal }}</div>
    <div>name: {{ record.name }}</div>
    <div>description: {{ record.description }}</div>
    <div>type: {{ record.type }}</div>
    <div>timestamp: {{ record.timestamp }}</div>
    <div>tags: {{ record.tags }}</div>
    <div>items: {{ record.items }}</div>
    <div>isValid: {{ record.isValid }}</div>
  </div>
  <div v-else>Record Not Found</div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import {
  AccountModel,
  GroupModel,
  JournalModel,
  RecordModel,
  UserModel,
} from "@white-rabbit/frontend-api";
import { useAuthStore } from "../stores";
import { useInject } from "../hooks";
import { ApiService, KEY_API_SERVICE } from "../services";

const api = useInject<ApiService>(KEY_API_SERVICE);
const authStore = useAuthStore();

const user = ref<UserModel>();
watchEffect(async () => {
  if (authStore.user) {
    user.value =
      (await api.user.findOne(authStore.user.token, {
        authIds: { authing: { $ne: null } },
      })) || undefined;
  }
});

const group = ref<GroupModel>();
watchEffect(async () => {
  if (authStore.user) {
    group.value =
      (await api.group.findOne(authStore.user.token, {})) || undefined;
  }
});

const journal = ref<JournalModel>();
watchEffect(async () => {
  if (authStore.user) {
    journal.value =
      (await api.journal.findOne(authStore.user.token, {})) || undefined;
  }
});

const account = ref<AccountModel>();
watchEffect(async () => {
  if (authStore.user && journal.value) {
    account.value =
      (await api.account.findOne(authStore.user.token, {
        journal: journal.value.id,
      })) || undefined;
  }
});

const record = ref<RecordModel>();
watchEffect(async () => {
  if (authStore.user && account.value) {
    record.value =
      (await api.record.findOne(authStore.user.token, {
        journal: account.value.journal,
        items: { account: account.value.id },
      })) || undefined;
  }
});
</script>
