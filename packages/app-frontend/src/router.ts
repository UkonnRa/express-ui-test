import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useAuthStore } from "./stores/auth";

const routes: RouteRecordRaw[] = [
  {
    name: "Callback",
    path: "/callback",
    component: () => import("./pages/LoginCallback.vue"),
    meta: {
      isProtected: false,
    },
  },
  {
    name: "User",
    path: "/user",
    alias: "/",
    component: () => import("./pages/UserPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  if (
    to.meta.isProtected === false ||
    (await authStore.currentUser()) != null
  ) {
    next();
  } else {
    await authStore.signIn();
  }
});

export default router;
