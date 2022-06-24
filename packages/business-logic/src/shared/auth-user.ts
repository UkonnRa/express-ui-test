import { UserEntity } from "../user";

export default interface AuthUser {
  readonly user?: UserEntity;
  readonly authId: { provider: string; value: string };
  readonly scopes: string[];
}
