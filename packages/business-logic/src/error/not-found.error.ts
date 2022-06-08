import AbstractError from "./abstract-error";
import { EntityName } from "@mikro-orm/core";

export default class NotFoundError extends AbstractError {
  protected readonly type: string = "NotFoundError";

  constructor(readonly entityType: EntityName<any>, readonly id: string) {
    super(`Type[${String(entityType)}, id=${id}] not found`);
  }
}
