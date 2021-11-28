import { OneToOne, Property } from '@mikro-orm/core';
import AbstractEntity from './abstract-entity';
import AccessList from './access-list';

abstract class AccessibleEntity<T extends AccessibleEntity<T>> extends AbstractEntity<T> {
  @Property()
  readonly name: string;

  @OneToOne(() => AccessList)
  readonly admins: AccessList;

  @OneToOne(() => AccessList)
  readonly members: AccessList;

  constructor(name: string, admins: AccessList, members: AccessList) {
    super();
    this.name = name;
    this.admins = admins;
    this.members = members;
  }
}

export default AccessibleEntity;
