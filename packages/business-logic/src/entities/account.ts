import { Cascade, Entity, Enum, OneToOne, Property } from '@mikro-orm/core';
import { Inventory, InventoryAverage, InventoryCreateOptions, InventoryFIFO } from './inventory';
import { AccessibleEntity, AccessibleEntityCreateOptions } from './accessible-entity';
import { DistributiveOmit } from '../utils';

export enum AccountType {
  ASSET,
  LIABILITY,
  INCOME,
  EXPENSE,
  EQUITY,
}

export type AccountCreateOptions = AccessibleEntityCreateOptions & {
  type: AccountType;
  unit: string;
  inventory: DistributiveOmit<InventoryCreateOptions, 'account'>;
};

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
  readonly inventory: Inventory;

  constructor({ name, admins, members, type, unit, inventory }: AccountCreateOptions) {
    super({ name, admins, members });
    this.type = type;
    this.unit = unit;
    const inventoryOptions = { ...inventory, account: this };
    if (inventoryOptions.type === 'AVERAGE') {
      this.inventory = new InventoryAverage(inventoryOptions);
    } else {
      this.inventory = new InventoryFIFO(inventoryOptions);
    }
  }
}
