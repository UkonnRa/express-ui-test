import { UserEntity } from "../user";

export default interface CreateGroupInput {
  readonly name: string;
  readonly description?: string;
  readonly admins: UserEntity[];
  readonly members: UserEntity[];
}
