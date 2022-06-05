import PageInfo from "./page-info";
import PageItem from "./page-item";

export default interface Page<V> {
  readonly pageInfo: PageInfo;
  readonly items: Array<PageItem<V>>;
}
