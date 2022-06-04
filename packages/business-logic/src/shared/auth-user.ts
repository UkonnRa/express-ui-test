import { UserEntity } from "../user";

export default interface AuthUser {
  readonly user?: UserEntity;
  readonly scopes: string[];
}
