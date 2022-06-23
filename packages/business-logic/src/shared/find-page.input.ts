import AbstractEntity from "./abstract-entity";
import Pagination from "./pagination";
import FindAllInput from "./find-all.input";
import Sort from "./sort";

export default interface FindPageInput<E extends AbstractEntity<E>>
  extends FindAllInput<E> {
  readonly pagination: Pagination;
  readonly sort: Sort[];
}
