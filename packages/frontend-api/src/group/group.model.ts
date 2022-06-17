import { AbstractModel } from "../shared";

export default interface GroupModel extends AbstractModel {
  readonly name: string;
  readonly description?: string;
}
