import { RoleValue } from "@white-rabbit/types";
import { AbstractModel } from "../shared";

export default interface UserModel extends AbstractModel {
  readonly name: string;
  readonly role: RoleValue;
  readonly authIds: Record<string, string>;
}
