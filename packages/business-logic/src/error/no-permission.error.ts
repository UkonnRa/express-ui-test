import { AbstractError } from "./abstract-error";
import { EntityName } from "@mikro-orm/core";

type PermissionType = "READ" | "WRITE";

export default class NoPermissionError extends AbstractError {
  protected readonly type: string = "NoPermissionError";

  constructor(
    readonly entityType: EntityName<any>,
    readonly permission: PermissionType
  ) {
    super(`No Permission[${permission}] on Type[${String(entityType)}]`);
  }
}
