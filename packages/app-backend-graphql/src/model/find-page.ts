import { Sort } from "@white-rabbit/types";

export default interface FindPage {
  readonly query?: string;
  readonly first?: number;
  readonly after?: string;
  readonly last?: number;
  readonly before?: string;
  readonly offset?: number;
  readonly sort: Sort[];
}
