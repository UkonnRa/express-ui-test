import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores";

const routes: RouteRecordRaw[] = [
  {
    name: "Callback",
    path: "/callback",
    component: () => import("../pages/LoginCallbackPage.vue"),
    meta: {
      isRaw: true,
      isProtected: false,
    },
  },
  {
    name: "User",
    path: "/user",
    alias: "/",
    component: () => import("../pages/UserPage.vue"),
  },
  {
    name: "AgGridTest",
    path: "/ag-grid",
    component: () => import("../pages/AgGridTestPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  if (to.meta.isProtected !== false) {
    const authStore = useAuthStore();
    const user = await authStore.loadUser();
    if (user == null) {
      await authStore.signIn();
    } else if (user.user == null) {
      await router.push({ name: "Register" });
    }
  }
  next();
});

export default router;
