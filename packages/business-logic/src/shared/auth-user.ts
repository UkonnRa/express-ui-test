import { AuthIdValue, UserEntity } from "../user";

export default interface AuthUser {
  readonly user?: UserEntity;
  readonly authId: AuthIdValue;
  readonly scopes: string[];
}
