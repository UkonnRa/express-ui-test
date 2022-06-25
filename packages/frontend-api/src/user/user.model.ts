import { AbstractModel } from "../shared";
import RoleValue from "./role.value";

export default interface UserModel extends AbstractModel {
  readonly name: string;
  readonly role: RoleValue;
  readonly authIds: Record<string, string>;
}
