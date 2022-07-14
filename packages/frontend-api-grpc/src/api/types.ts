import { Order, Sort } from "@white-rabbit/types";
import {
  Order as OrderProto,
  PageInfo,
  Sort as SortProto,
} from "../proto/shared";

export interface PageItemProto<P> {
  readonly cursor: string;
  readonly data?: P;
}

export interface PageProto<P> {
  pageInfo?: PageInfo;
  items: Array<PageItemProto<P>>;
}

export interface NullableEntity<P> {
  readonly item?: P;
}

export interface Commands<CP> {
  readonly commands: CP[];
}

export function sortToProto(sort: Sort[]): SortProto[] {
  return sort.map(({ field, order }) => ({
    field,
    order: order === Order.ASC ? OrderProto.ASC : OrderProto.DESC,
  }));
}
