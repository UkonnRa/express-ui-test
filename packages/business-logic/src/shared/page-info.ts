export default interface PageInfo {
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
  readonly startCursor: string;
  readonly endCursor: string;
}
