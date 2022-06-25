<script setup lang="ts">
import { Api, SYMBOL_API } from "@white-rabbit/components";
import { inject, watchEffect } from "vue";
import { useAsyncState } from "@vueuse/core";
import { UserManager } from "oidc-client-ts";
import {
  ACCOUNT_READ_SCOPE,
  ACCOUNT_WRITE_SCOPE,
  GROUP_READ_SCOPE,
  GROUP_WRITE_SCOPE,
  JOURNAL_READ_SCOPE,
  JOURNAL_WRITE_SCOPE,
  RECORD_READ_SCOPE,
  RECORD_WRITE_SCOPE,
  USER_READ_SCOPE,
  USER_WRITE_SCOPE,
} from "@white-rabbit/frontend-api";

const api = inject<Api>(SYMBOL_API);
if (!api) {
  throw new Error("API not found");
}

const { isReady, state, error } = useAsyncState(async () => {
  const manager = new UserManager({
    authority: import.meta.env.VITE_OPENID_DISCOVERY_URL ?? "",
    client_id: import.meta.env.VITE_OPENID_APP_ID ?? "",
    redirect_uri: import.meta.env.VITE_OPENID_CALLBACK_URL ?? "",
    scope: [
      "openid",
      "email",
      "profile",
      USER_READ_SCOPE,
      USER_WRITE_SCOPE,
      GROUP_READ_SCOPE,
      GROUP_WRITE_SCOPE,
      ACCOUNT_READ_SCOPE,
      ACCOUNT_WRITE_SCOPE,
      JOURNAL_READ_SCOPE,
      JOURNAL_WRITE_SCOPE,
      RECORD_READ_SCOPE,
      RECORD_WRITE_SCOPE,
    ].join(" "),
  });

  const user = await manager.signinRedirect();

  console.log(user);

  return api.group.findOne({ query: {} });
}, null);

watchEffect(() => error.value != null && console.error(error.value));
</script>

<template>
  <div v-if="isReady">
    <div v-if="state">
      <div>User: {{ state.id }}</div>
      <div>Name: {{ state.name }}</div>
    </div>
    <div v-else>User Not Found</div>
  </div>
  <div v-else>Loading...</div>
</template>
