import { FindPageInput as OriginalFindPageInput } from "@white-rabbit/types";
import AbstractEntity from "./abstract-entity";
import AuthUser from "./auth-user";

export default interface FindPageInput<E extends AbstractEntity<E>, Q>
  extends OriginalFindPageInput<Q> {
  readonly authUser: AuthUser;
}
