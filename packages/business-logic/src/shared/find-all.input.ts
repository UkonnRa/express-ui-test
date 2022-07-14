import { FindAllInput as OriginalFindAllInput } from "@white-rabbit/types";
import FindInput from "./find.input";

export default interface FindAllInput<Q>
  extends FindInput<Q>,
    OriginalFindAllInput<Q> {}
