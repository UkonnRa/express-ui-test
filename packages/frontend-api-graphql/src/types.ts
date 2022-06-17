import { PageInfo, Sort } from "@white-rabbit/frontend-api";

export interface FindOneVariables {
  readonly query?: string;
}

export interface FindPageVariables {
  readonly query?: string;
  readonly first?: number;
  readonly after?: string;
  readonly last?: number;
  readonly before?: string;
  readonly offset?: number;
  readonly sort: Sort[];
}

export interface Connection<M> {
  readonly pageInfo: PageInfo;
  readonly edges: Array<Edge<M>>;
}

export interface Edge<M> {
  readonly node: M;
  readonly cursor: string;
}
