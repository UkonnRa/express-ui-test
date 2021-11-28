import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Inventory } from './inventory';

@Entity()
class InventoryRecord {
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

  constructor(timestamp: Date, inventory: Inventory, amount: number, buyingUnit?: string, buyingPrice?: number) {
    this.timestamp = timestamp;
    this.inventory = inventory;
    this.amount = amount;
    this.buyingUnit = buyingUnit;
    this.buyingPrice = buyingPrice;
  }
}

export default InventoryRecord;
