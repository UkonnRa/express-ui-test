import { defineStore } from "pinia";
import { AuthUser } from "../services";

type AuthState = {
  user?: AuthUser;
};

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({}),
  actions: {
    async loadUser(): Promise<AuthUser | undefined> {
      this.user = (await this.authService.getUser()) ?? undefined;
      return this.user;
    },
    async signIn() {
      await this.authService.signIn();
    },
    async signInCallback() {
      await this.authService.signInCallback();
    },
    async signOut() {
      await this.authService.signOut();
    },
    async signOutCallback() {
      await this.authService.signOutCallback();
    },
  },
});
