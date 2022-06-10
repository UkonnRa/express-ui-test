import AbstractError from "./abstract-error";

export default class AlreadyExistError extends AbstractError {
  readonly type: string = "AlreadyExistError";

  constructor(readonly entityType: string, readonly filter: string) {
    super(`Type[${entityType}] with Filter[${filter}] already exists`);
  }
}
