import AbstractEntity from '../../shared/abstract-entity';
import { AccessItem, AccessItemCreateOptions, AccessItemGroup, AccessItemUser } from './access-item';
import { Group } from '../group';
import { User } from '../user';
import { DistributiveOmit } from '../../utils';
import { AccessListValue } from './journal-value';

export type AccessListCreateOptions =
  | { type: 'ITEMS'; items?: DistributiveOmit<AccessItemCreateOptions, 'parent'>[] }
  | { type: 'USERS'; users: User[] }
  | { type: 'GROUPS'; groups: Group[] };

export class AccessList extends AbstractEntity<AccessList, AccessListValue> {
  readonly items: AccessItem[];

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
    this.items = items;
  }

  contains(user: User): boolean {
    return this.items.some((i) => i.contains(user));
  }

  toValue(): AccessListValue {
    return { items: this.items.map((i) => i.toValue()) };
  }

  isReadable(): boolean {
    throw new Error('Method not implemented.');
  }

  isWritable(): boolean {
    throw new Error('Method not implemented.');
  }
}
