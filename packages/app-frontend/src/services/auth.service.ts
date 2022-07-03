import { AuthService, AuthUser } from "@white-rabbit/components";
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
import { User, UserManager } from "oidc-client-ts";
import { apiService } from "./api.service";

const manager = new UserManager({
  authority: import.meta.env.VITE_OPENID_DISCOVERY_URL ?? "",
  client_id: import.meta.env.VITE_OPENID_APP_ID ?? "",
  redirect_uri: import.meta.env.VITE_OPENID_CALLBACK_URL ?? "",

  // https://docs.authing.cn/v2/federation/oidc/authorization-code/?build-url=curl
  // For Authing, if the service want refresh_token in PKCE mode, prompt must be "consent"
  // and scope should contain "offline_access".
  // Then UserManager will refresh the access_token and id_token automatically, nice!
  prompt: "consent",
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

export const authService: AuthService<User> = {
  async getUser(): Promise<AuthUser<User> | null> {
    const token = await manager.getUser();
    if (token == null) {
      return null;
    }
    const provider = import.meta.env.VITE_OPENID_PROVIDER ?? "";
    const user = await apiService.user.findOne(token, {
      authIds: { [provider]: token.profile.sub },
    });
    return {
      user: user || undefined,
      token,
    };
  },
  signIn(): Promise<void> {
    return manager.signinRedirect();
  },
  async signInCallback(): Promise<void> {
    await manager.signinRedirectCallback();
  },
  signOut(): Promise<void> {
    return manager.signoutRedirect();
  },
  async signOutCallback(): Promise<void> {
    await manager.signoutRedirectCallback();
  },
};
