import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useAuth } from "../hooks";

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
  const { getUser, signin } = useAuth();
  if (to.meta.isProtected === false || (await getUser()) != null) {
    next();
  } else {
    await signin();
  }
});

export default router;
