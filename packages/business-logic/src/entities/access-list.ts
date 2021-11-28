import { Cascade, Collection, Entity, OneToMany } from '@mikro-orm/core';
import AbstractEntity from './abstract-entity';
import { AccessItem, AccessItemGroup, AccessItemUser } from './access-item';
import Group from './group';
import { User } from './user';

@Entity()
class AccessList extends AbstractEntity<AccessList> {
  @OneToMany(() => AccessItem, (record) => record.parent, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  readonly items: Collection<AccessItem>;

  constructor(items?: AccessItem[]) {
    super();
    this.items = new Collection<AccessItem>(this, items);
  }

  static fromUsers(users: User[]): AccessList {
    const result = new AccessList();
    result.items.set(users.map((u) => new AccessItemUser(result, u)));
    return result;
  }

  static fromGroups(groups: Group[]): AccessList {
    const result = new AccessList();
    result.items.set(groups.map((g) => new AccessItemGroup(result, g)));
    return result;
  }
}

export default AccessList;
