import { JournalView } from "./views";

export const ROUTE_JOURNALS_VIEW = Symbol("ROUTE_JOURNALS_VIEW");

export const routes = [
  { path: "/journals", component: JournalView, name: ROUTE_JOURNALS_VIEW },
];
