import {
  BaseEntity,
  Entity,
  Filter,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { v4 } from "uuid";
import ValidationLengthError from "../error/validation-length.error";

@Entity({ abstract: true })
@Filter({
  name: "excludeDeleted",
  default: true,
  cond: { deletedAt: null },
})
export default abstract class AbstractEntity<
  E extends AbstractEntity<E>
> extends BaseEntity<E, "id"> {
  @PrimaryKey({ type: "string" })
  id = v4();

  @Property({ type: Date })
  createdAt: Date = new Date();

  @Property({ type: Date, version: true })
  updatedAt: Date = new Date();

  @Property({ type: Date, nullable: true })
  deletedAt?: Date;

  protected checkLength(
    entityType: string,
    field: string,
    length: number,
    { min, max }: { min?: number; max?: number }
  ): void {
    if ((min != null && length < min) || (max != null && length > max)) {
      throw new ValidationLengthError(entityType, field, { min, max });
    }
  }
}
