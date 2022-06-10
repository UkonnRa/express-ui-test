export default interface PageItem<E> {
  readonly cursor: string;
  readonly data: E;
}
