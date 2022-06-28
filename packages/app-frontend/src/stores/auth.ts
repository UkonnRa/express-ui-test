import { defineStore } from "pinia";
import { User, UserManager } from "oidc-client-ts";
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

const manager = new UserManager({
  authority: import.meta.env.VITE_OPENID_DISCOVERY_URL ?? "",
  client_id: import.meta.env.VITE_OPENID_APP_ID ?? "",
  redirect_uri: import.meta.env.VITE_OPENID_CALLBACK_URL ?? "",

  scope: [
    "openid",
    "email",
    "profile",
    "phone",
    "offline_access",
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

export const useAuthStore = defineStore("auth", {
  state: () => {
    return {
      manager,
    };
  },

  actions: {
    async signIn() {
      await this.manager.signinRedirect();
    },
    async signInCallback(): Promise<User> {
      return await this.manager.signinRedirectCallback();
    },
    async signOut() {
      await this.manager.signoutRedirect();
    },
    async currentUser(): Promise<User | null> {
      return await this.manager.getUser();
    },
  },
});
