export default interface Pagination {
  readonly after?: string;
  readonly before?: string;
  readonly size?: number;
  readonly offset?: number;
}
