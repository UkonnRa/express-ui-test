import { FindInput as OriginalFindInput } from "@white-rabbit/types";
import AbstractEntity from "./abstract-entity";
import AuthUser from "./auth-user";

export default interface FindInput<E extends AbstractEntity<E>, Q>
  extends OriginalFindInput<Q> {
  readonly authUser: AuthUser;
}
