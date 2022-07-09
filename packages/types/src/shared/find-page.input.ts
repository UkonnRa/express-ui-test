import Pagination from "./pagination";
import Sort from "./sort";
import FindInput from "./find.input";

export default interface FindPageInput<Q> extends FindInput<Q> {
  readonly pagination: Pagination;
  readonly sort: Sort[];
}
