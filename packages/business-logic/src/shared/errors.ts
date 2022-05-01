import dayjs from "dayjs";

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
    readonly type: symbol,
    readonly operatorId?: string,
    readonly id?: string,
    readonly field?: string
  ) {
    super(
      `User[${String(
        operatorId
      )}] has no authorization for operations on Type[${String(
        type.description
      )}] with Id[${String(id)}] on Field[${String(field)}]`
    );
  }
}

export class NotFoundError extends AbstractError {
  override readonly name = "NotFound";

  override readonly code = 404;

  constructor(readonly type: symbol, readonly id: string) {
    super(`Type[${String(type.description)}] with Id[${id}] is not found`);
  }
}

export class FieldValidationLengthError extends AbstractError {
  override readonly name = "FieldValidationLength";

  override readonly code = 401;

  constructor(
    readonly type: symbol,
    readonly field: string,
    readonly min?: number,
    readonly max?: number
  ) {
    super(
      `Field[${field}] in Type[${String(
        type.description
      )}] should be between ${String(min)} and ${String(max)}`
    );
  }
}

export class FieldValidationZeroError extends AbstractError {
  override readonly name = "FieldValidationZero";

  override readonly code = 401;

  constructor(
    readonly type: symbol,
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
    super(
      `Field[${field}] in Type[${String(type.description)}] should be ${range}`
    );
  }
}

export class FieldStartEndDateMismatchError extends AbstractError {
  override readonly name = "FieldStartEndDateMismatch";

  override readonly code = 401;

  constructor(
    readonly type: symbol,
    readonly startField: string,
    readonly endField: string,
    readonly startValue: Date,
    readonly endValue: Date
  ) {
    super(
      `StartField[${startField}, value=${dayjs(
        startValue
      ).format()}] in Type[${String(
        type.description
      )}] should strictly before EndField[${endField}, value=${dayjs(
        endValue
      ).format()}]`
    );
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

  constructor(readonly type: symbol, readonly field: string) {
    super(
      `Field[${field}] is not sortable in Type[${String(type.description)}]`
    );
  }
}

export class FieldNotQueryableError extends AbstractError {
  override readonly name = "FieldNotQueryable";

  override readonly code = 401;

  constructor(readonly type: symbol, readonly field: string) {
    super(
      `Field[${field}] is not queryable in Type[${String(type.description)}]`
    );
  }
}

export class InvalidTextError extends AbstractError {
  override readonly name = "InvalidText";

  override readonly code = 401;

  constructor(
    readonly type: symbol,
    readonly field: string,
    readonly text: string
  ) {
    super(
      `Text[${text}] is not valid for Field[${field}] in Type[${String(
        type.description
      )}]`
    );
  }
}

export class FinRecordNotZeroOutError extends AbstractError {
  override readonly name = "FinRecordNotZeroOut";

  override readonly code = 401;

  constructor(
    readonly finRecordName: string,
    readonly leftSide: number,
    readonly rightSide: number
  ) {
    super(
      `FinRecord[name = ${finRecordName}] does not zero out. The left side (assets + expenses) is ${leftSide} and the right side (liabilities + equity + income) is ${rightSide}`
    );
  }
}
