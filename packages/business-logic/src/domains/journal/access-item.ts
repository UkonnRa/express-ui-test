import { User } from '../user';
import { Group } from '../group';
import { AccessList } from './access-list';
import AbstractEntity from '../../shared/abstract-entity';

export type AccessItemType = 'USER' | 'GROUP';

export abstract class AccessItem extends AbstractEntity<AccessItem> {
  readonly type: AccessItemType;

  readonly parent: AccessList;

  protected constructor(parent: AccessList) {
    super();
    this.parent = parent;
  }

  abstract contains(user: User): boolean;
}

export class AccessItemUser extends AccessItem {
  override readonly type = 'USER';

  readonly user: User;

  constructor({ parent, user }: Omit<AccessItemUserCreateOptions, 'type'>) {
    super(parent);
    this.user = user;
  }

  override contains(user: User): boolean {
    return user.id === this.user.id;
  }
}

export class AccessItemGroup extends AccessItem {
  override readonly type = 'GROUP';

  readonly group: Group;

  constructor({ parent, group }: Omit<AccessItemGroupCreateOptions, 'type'>) {
    super(parent);
    this.group = group;
  }

  contains(user: User): boolean {
    return this.group.contains(user);
  }
}

export type AccessItemUserCreateOptions = {
  type: 'USER';
  parent: AccessList;
  user: User;
};

export type AccessItemGroupCreateOptions = {
  type: 'GROUP';
  parent: AccessList;
  group: Group;
};

export type AccessItemCreateOptions = AccessItemUserCreateOptions | AccessItemGroupCreateOptions;
