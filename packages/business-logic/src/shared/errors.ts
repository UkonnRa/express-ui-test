export abstract class AbstractError extends Error {
  readonly code: number;
}

export class NoExpectedScopeError extends AbstractError {
  override readonly name = "NoExpectedScope";

  override readonly code = 401;

  constructor(readonly operatorId: string, readonly scope: string) {
    super(
      `Scope[${scope}] is not found in the access token for User[${operatorId}], please check your login tokens`
    );
  }
}

export class NoAuthError extends AbstractError {
  override readonly name = "NoAuth";

  override readonly code = 401;

  constructor(
    readonly type: string,
    readonly operatorId?: string,
    readonly id?: string,
    readonly field?: string
  ) {
    super(
      `User[${String(
        operatorId
      )}] has no authorization for operations on Type[${type}] with Id[${String(
        id
      )}] on Field[${String(field)}]`
    );
  }
}

export class NotFoundError extends AbstractError {
  override readonly name = "NotFound";

  override readonly code = 404;

  constructor(readonly type: string, readonly id: string) {
    super(`Type[${type}] with Id[${id}] is not found`);
  }
}

export class FieldValidationLengthError extends AbstractError {
  override readonly name = "FieldValidationLength";

  override readonly code = 401;

  constructor(
    readonly type: string,
    readonly field: string,
    readonly min?: number,
    readonly max?: number
  ) {
    super(
      `Field[${field}] in Type[${type}] should be between ${String(
        min
      )} and ${String(max)}`
    );
  }
}

export class FieldValidationZeroError extends AbstractError {
  override readonly name = "FieldValidationZero";

  override readonly code = 401;

  constructor(
    readonly type: string,
    readonly field: string,
    readonly isPositive: boolean,
    readonly orZero: boolean = false
  ) {
    let range = "positive";
    if (isPositive && orZero) {
      range = "non-negative";
    } else if (!isPositive && !orZero) {
      range = "negative";
    } else if (!isPositive && orZero) {
      range = "non-positive";
    }
    super(`Field[${field}] in Type[${type}] should be ${range}`);
  }
}

export class InvalidCursorError extends AbstractError {
  override readonly name = "InvalidCursor";

  override readonly code = 401;

  constructor(readonly cursor: string) {
    super(`Cursor[${cursor}] is invalid`);
  }
}

export class InvalidQueryError extends AbstractError {
  override readonly name = "InvalidQuery";

  override readonly code = 401;

  constructor(readonly query?: string) {
    super(`Query[${String(query)}] is invalid`);
  }
}

export class InvalidSortFieldError extends AbstractError {
  override readonly name = "InvalidSortField";

  override readonly code = 401;

  constructor(readonly type: string, readonly field: string) {
    super(`Field[${field}] is not sortable in Type[${type}]`);
  }
}

export class FieldNotQueryableError extends AbstractError {
  override readonly name = "FieldNotQueryableError";

  override readonly code = 401;

  constructor(readonly type: string, readonly field: string) {
    super(`Field[${field}] is not queryable in Type[${type}]`);
  }
}
