import { BaseEntity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

export default abstract class AbstractEntity<T extends AbstractEntity<T>> extends BaseEntity<T, 'id'> {
  @PrimaryKey()
  readonly id: string = v4();

  @Property()
  readonly createdAt: Date = new Date();

  @Property({ version: true })
  readonly updatedAt: Date;
}
