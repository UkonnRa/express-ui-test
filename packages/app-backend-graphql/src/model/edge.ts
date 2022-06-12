import { AbstractEntity } from "@white-rabbit/business-logic";
import { EntityDTO } from "@mikro-orm/core";

export default interface Edge<E extends AbstractEntity<E>> {
  readonly node: EntityDTO<E>;
  readonly cursor: string;
}
