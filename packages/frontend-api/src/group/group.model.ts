import { AbstractModel } from "../shared";
import { UserModel } from "../user";

export default interface GroupModel extends AbstractModel {
  readonly name: string;
  readonly description: string;
  readonly admins: Array<Pick<UserModel, "id" | "name">>;
  readonly members: Array<Pick<UserModel, "id" | "name">>;
  readonly isWriteable: boolean;
}
