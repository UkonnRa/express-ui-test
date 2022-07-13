import { FindPageInput as OriginalFindPageInput } from "@white-rabbit/types";
import AuthUser from "./auth-user";

export default interface FindPageInput<Q> extends OriginalFindPageInput<Q> {
  readonly authUser: AuthUser;
}
