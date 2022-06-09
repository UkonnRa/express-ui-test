import AbstractError from "./abstract-error";

export default class AlreadyExistError extends AbstractError {
  readonly type: string = "AlreadyExistError";

  constructor(
    readonly entityType: string,
    readonly field: string,
    readonly value: string
  ) {
    super(
      `Type[${entityType}] with Field[${field}, value=${value}] already exists`
    );
  }
}
