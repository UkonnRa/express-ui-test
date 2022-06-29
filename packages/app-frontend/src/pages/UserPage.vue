<script setup lang="ts">
import { inject, watchEffect } from "vue";
import { useAsyncState } from "@vueuse/core";
import { useAuthStore } from "../stores/auth";
import { Api, KEY_API } from "@white-rabbit/components";
import { User } from "oidc-client-ts";
import {
  AccountModel,
  GroupModel,
  JournalModel,
  RecordModel,
  UserModel,
} from "@white-rabbit/frontend-api";

const authStore = useAuthStore();
const api = inject<Api>(KEY_API);
if (!api) {
  throw new Error("Cannot find api");
}

const { isReady, state, error } = useAsyncState<
  | [
      User | null,
      UserModel | null,
      GroupModel | null,
      JournalModel | null,
      AccountModel | null,
      RecordModel | null
    ]
  | null
>(async () => {
  const authUser = await authStore.currentUser();
  const user =
    authUser &&
    (await api.user.findOne(authUser, {
      query: { authIds: { authing: { $ne: null } } },
    }));
  const group = authUser && (await api.group.findOne(authUser, { query: {} }));
  const journal =
    authUser && (await api.journal.findOne(authUser, { query: {} }));
  const account =
    authUser && (await api.account.findOne(authUser, { query: {} }));
  const record =
    authUser &&
    (await api.record.findOne(authUser, { query: { journal: journal?.id } }));
  return [authUser, user, group, journal, account, record];
}, null);

watchEffect(() => error.value != null && console.error(error.value));
</script>

<template>
  <div v-if="isReady">
    <div v-if="state[0]">
      <div>ID Token: {{ state[0].id_token }}</div>
      <div>Access Token: {{ state[0].access_token }}</div>
      <div>Scope: {{ state[0].scopes }}</div>
    </div>
    <div v-else>AuthUser Not Found</div>
    <div>===</div>
    <div v-if="state[1]">
      <div>ID: {{ state[1].id }}</div>
      <div>createdAt: {{ state[1].createdAt }}</div>
      <div>updatedAt: {{ state[1].updatedAt }}</div>
      <div>name: {{ state[1].name }}</div>
      <div>role: {{ state[1].role }}</div>
      <div>authIds: {{ state[1].authIds }}</div>
    </div>
    <div v-else>User Not Found</div>
    <div>===</div>
    <div v-if="state[2]">
      <div>ID: {{ state[2].id }}</div>
      <div>createdAt: {{ state[2].createdAt }}</div>
      <div>updatedAt: {{ state[2].updatedAt }}</div>
      <div>name: {{ state[2].name }}</div>
      <div>description: {{ state[2].description }}</div>
      <div>admins: {{ state[2].admins }}</div>
      <div>members: {{ state[2].members }}</div>
    </div>
    <div v-else>Group Not Found</div>
    <div>===</div>
    <div v-if="state[3]">
      <div>ID: {{ state[3].id }}</div>
      <div>createdAt: {{ state[3].createdAt }}</div>
      <div>updatedAt: {{ state[3].updatedAt }}</div>
      <div>name: {{ state[3].name }}</div>
      <div>description: {{ state[3].description }}</div>
      <div>tags: {{ state[3].tags }}</div>
      <div>unit: {{ state[3].unit }}</div>
      <div>archived: {{ state[3].archived }}</div>
      <div>admins: {{ state[3].admins }}</div>
      <div>members: {{ state[3].members }}</div>
    </div>
    <div v-else>Journal Not Found</div>
    <div>===</div>
    <div v-if="state[4]">
      <div>ID: {{ state[4].id }}</div>
      <div>createdAt: {{ state[4].createdAt }}</div>
      <div>updatedAt: {{ state[4].updatedAt }}</div>
      <div>name: {{ state[4].name }}</div>
      <div>description: {{ state[4].description }}</div>
      <div>type: {{ state[4].type }}</div>
      <div>strategy: {{ state[4].strategy }}</div>
      <div>unit: {{ state[4].unit }}</div>
      <div>archived: {{ state[4].archived }}</div>
    </div>
    <div v-else>Account Not Found</div>
    <div>===</div>
    <div v-if="state[5]">
      <div>ID: {{ state[5].id }}</div>
      <div>createdAt: {{ state[5].createdAt }}</div>
      <div>updatedAt: {{ state[5].updatedAt }}</div>
      <div>journal: {{ state[5].journal }}</div>
      <div>name: {{ state[5].name }}</div>
      <div>description: {{ state[5].description }}</div>
      <div>type: {{ state[5].type }}</div>
      <div>timestamp: {{ state[5].timestamp }}</div>
      <div>tags: {{ state[5].tags }}</div>
      <div>items: {{ state[5].items }}</div>
      <div>isValid: {{ state[5].isValid }}</div>
    </div>
    <div v-else>Record Not Found</div>
  </div>
  <div v-else>Loading...</div>
</template>
