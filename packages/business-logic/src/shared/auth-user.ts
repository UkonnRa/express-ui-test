import { encodeURL } from 'js-base64';
import { User } from '../domains/user';

export type AuthId = {
  readonly provider: string;
  readonly id: string;
};

export default class AuthUser {
  constructor(readonly authId: AuthId, readonly scopes: string[], readonly user?: User) {}

  get authIdValue(): string {
    return encodeURL(JSON.stringify(this.authId));
  }
}
