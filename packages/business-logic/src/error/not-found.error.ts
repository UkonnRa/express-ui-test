import AbstractError from "./abstract-error";

export default class NotFoundError extends AbstractError {
  readonly type: string = "NotFoundError";

  constructor(readonly entityType: string, readonly id: string) {
    super(`Type[${entityType}, id=${id}] not found`);
  }
}
