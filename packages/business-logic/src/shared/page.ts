import { PageInfo, PageItem } from "./index";

export default interface Page<V> {
  readonly pageInfo: PageInfo;
  readonly items: Array<PageItem<V>>;
}
