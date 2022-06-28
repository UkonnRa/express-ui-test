<script setup lang="ts">
import { inject, watchEffect } from "vue";
import { useAsyncState } from "@vueuse/core";
import { useAuthStore } from "../stores/auth";
import { Api, KEY_API } from "@white-rabbit/components";

const authStore = useAuthStore();
const api = inject<Api>(KEY_API);
if (!api) {
  throw new Error("Cannot find api");
}

const { isReady, state, error } = useAsyncState(async () => {
  const authUser = await authStore.currentUser();
  const user =
    authUser &&
    (await api.user.findOne(authUser, {
      query: { authIds: { authing: { $ne: null } } },
    }));
  const group = authUser && (await api.group.findOne(authUser, { query: {} }));
  return [authUser, user, group];
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
  </div>
  <div v-else>Loading...</div>
</template>
