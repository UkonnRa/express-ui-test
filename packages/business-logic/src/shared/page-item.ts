import { EntityDTO } from "@mikro-orm/core";

export default interface PageItem<E> {
  readonly cursor: string;
  readonly data: EntityDTO<E>;
}
