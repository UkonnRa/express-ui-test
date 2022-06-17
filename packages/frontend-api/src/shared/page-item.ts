export default interface PageItem<M> {
  readonly cursor: string;
  readonly data: M;
}
