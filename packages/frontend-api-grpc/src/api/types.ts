import { PageInfo } from "../proto/shared";

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
