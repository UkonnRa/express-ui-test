import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { AuthUser } from "../services";

type AuthState = {
  _user?: AuthUser;
};

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({}),
  getters: {
    user(): AuthUser {
      if (this._user == null) {
        throw new Error("user not found");
      }
      return this._user;
    },
  },
  actions: {
    async loadUser(): Promise<AuthUser> {
      this._user = (await this.authService.getUser()) ?? undefined;
      return this.user;
    },
    async signIn() {
      await this.authService.signIn();
    },
    async signInCallback() {
      const user = await this.authService.signInCallback();
      if (user == null) {
        const router = useRouter();
        await router.push({ name: "Register" });
      }
    },
    async signOut() {
      await this.authService.signOut();
    },
    async signOutCallback() {
      await this.authService.signOutCallback();
    },
  },
});
