import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores";

const routes: RouteRecordRaw[] = [
  {
    path: "",
    redirect: { name: "Journals" },
  },
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
    name: "Journals",
    path: "/journals",
    component: () => import("../pages/JournalPage.vue"),
    children: [
      {
        name: "Journal",
        path: ":id",
        component: () => import("../pages/JournalPage.vue"),
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
