import { User } from '../domains/user';

export default class AuthUser {
  constructor(readonly user: User, readonly scopes: string[]) {}
}
