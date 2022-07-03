import { UserModel } from "@white-rabbit/frontend-api";

export type AuthService<T = unknown> = {
  getUser(): Promise<AuthUser<T> | null>;
  signIn(): Promise<void>;
  signInCallback(): Promise<void>;
  signOut(): Promise<void>;
  signOutCallback(): Promise<void>;
};

export type AuthUser<T = unknown> = {
  readonly user: UserModel;
  readonly token: T;
};
