import AbstractError from "./abstract-error";

export default class ValidationLengthError extends AbstractError {
  protected readonly type: string = "ValidationLengthError";

  constructor(
    readonly entityType: string,
    readonly field: string,
    readonly range: { min?: number; max?: number }
  ) {
    super(
      `The length of Field[${field}] of Type[${entityType}] should be in range ${JSON.stringify(
        range
      )}`
    );
  }
}
