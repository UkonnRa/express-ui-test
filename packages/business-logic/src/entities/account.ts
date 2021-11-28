import { Cascade, Entity, Enum, OneToOne, Property } from '@mikro-orm/core';
import { Inventory } from './inventory';
import AccessibleEntity from './accessible-entity';
import AccessList from './access-list';

export enum AccountType {
  ASSET,
  LIABILITY,
  INCOME,
  EXPENSE,
  EQUITY,
}

@Entity()
export class Account extends AccessibleEntity<Account> {
  @Enum()
  readonly type: AccountType;

  @Property()
  readonly unit: string;

  @OneToOne(() => Inventory, (inventory) => inventory.account, {
    owner: true,
    orphanRemoval: true,
    cascade: [Cascade.ALL],
  })
  inventory: Inventory;

  constructor(name: string, admins: AccessList, members: AccessList, type: AccountType, unit: string) {
    super(name, admins, members);
    this.type = type;
    this.unit = unit;
  }
}
