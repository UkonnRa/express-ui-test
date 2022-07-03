import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores";

const routes: RouteRecordRaw[] = [
  {
    name: "Callback",
    path: "/callback",
    component: () => import("../pages/LoginCallbackPage.vue"),
    meta: {
      isProtected: false,
    },
  },
  {
    name: "User",
    path: "/user",
    alias: "/",
    component: () => import("../components/AppScaffold.vue"),
    children: [
      {
        path: "",
        component: () => import("../pages/UserPage.vue"),
      },
    ],
  },
  {
    name: "AgGridTest",
    path: "/ag-grid",
    component: () => import("../components/AppScaffold.vue"),
    children: [
      {
        path: "",
        component: () => import("../pages/AgGridTestPage.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  if (to.meta.isProtected !== false) {
    const authStore = useAuthStore();
    await authStore.loadUser();
  }

  next();
});

export default router;
