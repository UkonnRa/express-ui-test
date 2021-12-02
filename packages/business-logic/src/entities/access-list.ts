import { Cascade, Collection, Entity, OneToMany } from '@mikro-orm/core';
import AbstractEntity from './abstract-entity';
import { AccessItem, AccessItemCreateOptions, AccessItemGroup, AccessItemUser } from './access-item';
import { Group } from './group';
import { User } from './user';
import { DistributiveOmit } from '../utils';

export type AccessListCreateOptions =
  | { type: 'ITEMS'; items?: DistributiveOmit<AccessItemCreateOptions, 'parent'>[] }
  | { type: 'USERS'; users: User[] }
  | { type: 'GROUPS'; groups: Group[] };

@Entity()
export class AccessList extends AbstractEntity<AccessList> {
  @OneToMany(() => AccessItem, (record) => record.parent, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  readonly items: Collection<AccessItem>;

  constructor(options: AccessListCreateOptions) {
    super();
    let items: AccessItem[];
    if (options.type === 'ITEMS') {
      items =
        options.items?.map((i) => {
          if (i.type === 'USER') {
            return new AccessItemUser({ parent: this, user: i.user });
          }
          return new AccessItemGroup({ parent: this, group: i.group });
        }) ?? [];
    } else if (options.type === 'USERS') {
      items = options.users.map((user) => new AccessItemUser({ parent: this, user }));
    } else {
      items = options.groups.map((group) => new AccessItemGroup({ parent: this, group }));
    }
    this.items = new Collection<AccessItem>(this, items);
  }
}
