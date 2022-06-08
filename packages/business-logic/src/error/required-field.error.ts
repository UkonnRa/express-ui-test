import AbstractError from "./abstract-error";

export default class RequiredFieldError extends AbstractError {
  protected readonly type: string = "RequiredFieldError";

  constructor(readonly entityType: string, readonly field: string) {
    super(`Field[${field}] of Type[${entityType}] is required`);
  }
}
