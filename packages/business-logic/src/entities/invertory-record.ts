import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Inventory } from './inventory';

export type InventoryRecordCreateOptions = {
  timestamp: Date;
  inventory: Inventory;
  amount: number;
  buyingUnit?: string;
  buyingPrice?: number;
};

@Entity()
export class InventoryRecord {
  @PrimaryKey()
  readonly id: string = v4();

  @Property()
  readonly timestamp: Date;

  @ManyToOne(() => Inventory)
  readonly inventory: Inventory;

  @Property()
  readonly amount: number;

  @Property({ nullable: true })
  readonly buyingUnit?: string;

  @Property({ nullable: true })
  readonly buyingPrice?: number;

  constructor({ timestamp, inventory, amount, buyingUnit, buyingPrice }: InventoryRecordCreateOptions) {
    this.timestamp = timestamp;
    this.inventory = inventory;
    this.amount = amount;
    this.buyingUnit = buyingUnit;
    this.buyingPrice = buyingPrice;
  }
}
