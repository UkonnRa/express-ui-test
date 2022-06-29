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

type UseAuthReturn = {
  readonly signin: UserManager["signinRedirect"];
  readonly signinCallback: UserManager["signinRedirectCallback"];
  readonly signout: UserManager["signoutRedirect"];
  readonly signoutCallback: UserManager["signoutRedirectCallback"];
  readonly getUser: UserManager["getUser"];
};

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

const useAuth = (): UseAuthReturn => {
  return {
    getUser: () => manager.getUser(),
    signin: () => manager.signinRedirect(),
    signinCallback: () => manager.signinRedirectCallback(),
    signout: () => manager.signoutRedirect(),
    signoutCallback: () => manager.signoutRedirectCallback(),
  };
};

export default useAuth;
