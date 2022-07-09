import { UserModel } from "@white-rabbit/frontend-api";
import { User } from "oidc-client-ts";
import { PageInfo, Sort } from "@white-rabbit/types";

export interface AuthUser {
  oidcUser: User;
  user: UserModel;
}

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
