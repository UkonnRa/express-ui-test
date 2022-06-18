import AbstractError from "./abstract-error";

export default class AlreadyArchivedError extends AbstractError {
  readonly type: string = "AlreadyArchivedError";

  constructor(readonly entityType: string, readonly id: string) {
    super(`Type[${entityType}, id=${id}] is already archived`);
  }
}
