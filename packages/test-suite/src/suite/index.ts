import { AuthId, AuthUser, Journal, User } from "@white-rabbit/business-logic";
import { Role } from "@white-rabbit/type-bridge";

export { AbstractSuite } from "./abstract-suite";
export { AccountSuite } from "./account-suite";
export { GroupSuite } from "./group-suite";
export { JournalSuite } from "./journal-suite";
export { UserSuite } from "./user-suite";

export type Input<T, Q, M> =
  | { type: "Value"; value: T }
  | { type: "Query"; query: Q }
  | { type: "Matcher"; matcher: M };

export interface UserMatcher {
  authId?: AuthId;
  role?: Role;
  containDeleted?: boolean;
}

export const tasks: object[] = [
  {
    type: "ReadTaskSingleSuccess",
    name: "Find self",
    input: ({ authUser, item }: { authUser: AuthUser; item: User }): boolean =>
      authUser.user?.id === item.id,
  },
  {
    type: "ReadTaskSingleSuccess",
    name: "Find one by Query",
    input: { type: "UserQueryFullText", keyword: { value: "a" } },
  },
  {
    type: "ReadTaskSingleFailure",
    name: "Find one failed: No permission",
    authUser: { role: Role.USER },
    input: ({
      authUser,
      item,
    }: {
      authUser: AuthUser;
      item: Journal;
    }): boolean => authUser.user != null && item.isReadable(authUser.user),
  },
  {
    type: "ReadTaskPageSuccess",
    name: "Find all by fullText",
    input: {
      sort: [{ field: "name", order: "ASC" }],
      pagination: { size: 2, startFrom: "FIRST" },
      query: { type: "UserQueryFullText", keyword: { value: "a" } },
    },
  },
  {
    type: "ReadTaskPageSuccess",
    name: "Find all from central",
    input: ({ items }: { items: Journal[] }) => {
      items.sort((a, b) => a.name.localeCompare(b.name));
      return {
        sort: [{ field: "name", order: "ASC" }],
        pagination: {
          size: 2,
          startFrom: "FIRST",
          after: items[items.length / 2].toCursor(),
        },
        query: { type: "UserQueryFullText", keyword: { value: "a" } },
      };
    },
  },
];
