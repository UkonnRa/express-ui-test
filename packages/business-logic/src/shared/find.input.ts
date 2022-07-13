import { FindInput as OriginalFindInput } from "@white-rabbit/types";
import AuthUser from "./auth-user";

export default interface FindInput<Q> extends OriginalFindInput<Q> {
  readonly authUser: AuthUser;
}
