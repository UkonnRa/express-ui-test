export const ROUTE_JOURNALS_VIEW = Symbol("ROUTE_JOURNALS_VIEW");
export const ROUTE_JOURNAL_DETAIL_VIEW = Symbol("ROUTE_JOURNAL_DETAIL_VIEW");

export const routes = [
  {
    path: "/journals",
    component: import("./views/JournalView.vue"),
    name: ROUTE_JOURNALS_VIEW,
  },
  {
    path: "/journal/:id",
    component: import("./views/JournalView.vue"),
    name: ROUTE_JOURNAL_DETAIL_VIEW,
  },
];
