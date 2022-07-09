import AbstractEntity from "./abstract-entity";
import Pagination from "./pagination";
import FindAllInput from "./find-all.input";
import Sort from "./sort";

export default interface FindPageInput<E extends AbstractEntity<E>, Q>
  extends FindAllInput<E, Q> {
  readonly pagination: Pagination;
  readonly sort: Sort[];
}
