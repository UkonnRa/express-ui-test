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

export class NoAuthError extends AbstractError {
  override readonly name = 'NoAuth';

  override readonly code = 401;

  readonly operatorId: string;

  constructor(user: User, readonly type: string, readonly id: string) {
    super(`User[${user.id}] has no auth on Type[${type}] with Id[${id}]`);
    this.operatorId = user.id;
  }
}

export class NotFoundError extends AbstractError {
  override readonly name = 'NotFound';

  override readonly code = 404;

  constructor(readonly type: string, readonly id: string) {
    super(`Type[${type}] with Id[${id}] is not found`);
  }
}

export class FieldValidationLengthError extends AbstractError {
  override readonly name = 'FieldValidationLength';

  override readonly code = 401;

  constructor(readonly type: string, readonly field: string, min?: number, max?: number) {
    super(`Field[${field}] in Type[${type}] should be between ${min} and ${max}`);
  }
}
