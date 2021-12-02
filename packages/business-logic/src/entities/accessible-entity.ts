import { OneToOne, Property } from '@mikro-orm/core';
import AbstractEntity from './abstract-entity';
import { AccessList, AccessListCreateOptions } from './access-list';

export type AccessibleEntityCreateOptions = {
  name: string;
  admins: AccessListCreateOptions;
  members: AccessListCreateOptions;
};

export abstract class AccessibleEntity<T extends AccessibleEntity<T>> extends AbstractEntity<T> {
  @Property()
  readonly name: string;

  @OneToOne(() => AccessList)
  readonly admins: AccessList;

  @OneToOne(() => AccessList)
  readonly members: AccessList;

  protected constructor({ name, admins, members }: AccessibleEntityCreateOptions) {
    super();
    this.name = name;
    this.admins = new AccessList(admins);
    this.members = new AccessList(members);
  }
}
