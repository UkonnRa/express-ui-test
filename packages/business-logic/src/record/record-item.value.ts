import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { AccountEntity } from "../account";
// eslint-disable-next-line import/no-cycle
import RecordEntity from "./record.entity";

@Entity({ collection: "record_item" })
export default class RecordItemValue {
  @ManyToOne(() => RecordEntity, {
    onDelete: "cascade",
    onUpdateIntegrity: "cascade",
    primary: true,
  })
  record: RecordEntity;

  @ManyToOne(() => AccountEntity, {
    onDelete: "cascade",
    onUpdateIntegrity: "cascade",
    primary: true,
  })
  account: AccountEntity;

  @Property({ type: "number" })
  amount: number;

  @Property({ type: "number", nullable: true })
  price?: number;

  constructor(
    record: RecordEntity,
    account: AccountEntity,
    amount: number,
    price?: number
  ) {
    this.record = record;
    this.account = account;
    this.amount = amount;
    this.price = price;
  }
}
