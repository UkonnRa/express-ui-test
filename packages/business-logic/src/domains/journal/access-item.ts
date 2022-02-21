import { User } from '../user';
import { Group } from '../group';
import { AccessList } from './access-list';
import AbstractEntity from '../../shared/abstract-entity';
import { AccessItemValue } from './index';

export type AccessItemType = 'USER' | 'GROUP';

export abstract class AccessItem extends AbstractEntity<AccessItem, AccessItemValue> {
  readonly type: AccessItemType;

  readonly parent: AccessList;

  protected constructor(parent: AccessList) {
    super();
    this.parent = parent;
  }

  abstract contains(user: User): boolean;

  abstract override toProjection(): AccessItemValue;
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

  override toProjection(): AccessItemValue {
    return { type: 'USER', userId: this.user.id };
  }

  // eslint-disable-next-line class-methods-use-this
  isReadable(): boolean {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this
  isWritable(): boolean {
    throw new Error('Method not implemented.');
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

  override toProjection(): AccessItemValue {
    return { type: 'GROUP', groupId: this.group.id };
  }

  // eslint-disable-next-line class-methods-use-this
  isReadable(): boolean {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this
  isWritable(): boolean {
    throw new Error('Method not implemented.');
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
