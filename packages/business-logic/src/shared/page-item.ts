export default interface PageItem<V> {
  readonly cursor: string;
  readonly data: V;
}
