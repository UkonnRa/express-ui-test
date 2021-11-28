// eslint-disable-next-line max-classes-per-file
import { Entity, Enum, ManyToOne } from '@mikro-orm/core';
import { User } from './user';
import Group from './group';
import AccessList from './access-list';
import AbstractEntity from './abstract-entity';

export type AccessTagType = 'USER' | 'GROUP';

@Entity({ abstract: true, discriminatorColumn: 'type' })
export abstract class AccessItem extends AbstractEntity<AccessItem> {
  @Enum()
  readonly type: AccessTagType;

  @ManyToOne(() => AccessList)
  readonly parent: AccessList;

  protected constructor(parent: AccessList) {
    super();
    this.parent = parent;
  }
}

@Entity({ discriminatorValue: 'USER' })
export class AccessItemUser extends AccessItem {
  override readonly type: AccessTagType = 'USER';

  @ManyToOne(() => User)
  readonly user: User;

  constructor(parent: AccessList, user: User) {
    super(parent);
    this.user = user;
  }
}

@Entity({ discriminatorValue: 'GROUP' })
export class AccessItemGroup extends AccessItem {
  override readonly type: AccessTagType = 'GROUP';

  @ManyToOne(() => Group)
  readonly group: Group;

  constructor(parent: AccessList, group: Group) {
    super(parent);
    this.group = group;
  }
}
