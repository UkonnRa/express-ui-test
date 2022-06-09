import AbstractError from "./abstract-error";

type PermissionType = "READ" | "WRITE";

export default class NoPermissionError extends AbstractError {
  readonly type: string = "NoPermissionError";

  constructor(
    readonly entityType: string,
    readonly permission: PermissionType
  ) {
    super(`No Permission[${permission}] on Type[${entityType}]`);
  }
}
