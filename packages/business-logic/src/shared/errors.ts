import { User } from '../domains/user';

export abstract class AbstractError extends Error {
  readonly code: number;
}

export class NoExpectedScopeError extends AbstractError {
  override readonly name = 'NoExpectedScope';

  override readonly code = 401;

  readonly operatorId: string;

  constructor({ id }: User, readonly scope: string) {
    super(`Scope[${scope}] is not found in the access token for User[${id}], please check your login tokens`);
    this.operatorId = id;
  }
}
