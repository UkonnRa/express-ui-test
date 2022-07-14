import FindInput from "./find.input";
import Sort from "./sort";

export default interface FindAllInput<Q> extends FindInput<Q> {
  readonly size?: number;
  readonly sort?: Sort[];
}
