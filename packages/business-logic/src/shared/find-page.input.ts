import { FindPageInput as OriginalFindPageInput } from "@white-rabbit/types";
import FindInput from "./find.input";

export default interface FindPageInput<Q>
  extends FindInput<Q>,
    OriginalFindPageInput<Q> {}
