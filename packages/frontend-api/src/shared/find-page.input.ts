import Pagination from "./pagination";
import Sort from "./sort";

export default interface FindPageInput {
  readonly query?: object;
  readonly pagination: Pagination;
  readonly sort: Sort[];
}
