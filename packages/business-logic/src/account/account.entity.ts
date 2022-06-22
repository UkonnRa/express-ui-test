import { Entity, Enum, ManyToOne, Property, Unique } from "@mikro-orm/core";
import { AbstractEntity } from "../shared";
import { JournalEntity } from "../journal";
import AccountTypeValue from "./account-type.value";
import AccountStrategyValue from "./account-strategy.value";

export const ACCOUNT_TYPE = "account";

export const ACCOUNT_TYPE_PLURAL = "accounts";

@Entity({ collection: ACCOUNT_TYPE })
@Unique({ properties: ["journal", "name"] })
export default class AccountEntity extends AbstractEntity<AccountEntity> {
  @ManyToOne(() => JournalEntity, {
    onDelete: "cascade",
    onUpdateIntegrity: "cascade",
  })
  journal: JournalEntity;

  @Property({ type: "string" })
  name: string;

  @Property({ type: "string" })
  description: string;

  @Enum({ type: "string", items: () => AccountTypeValue })
  type: AccountTypeValue;

  @Enum({ type: "string", items: () => AccountStrategyValue })
  strategy: AccountStrategyValue;

  @Property({ type: "string" })
  unit: string;

  @Property({ type: "boolean" })
  archived: boolean = false;

  constructor(
    journal: JournalEntity,
    name: string,
    description: string,
    type: AccountTypeValue,
    strategy: AccountStrategyValue,
    unit: string
  ) {
    super();
    this.journal = journal;
    this.name = name;
    this.description = description;
    this.type = type;
    this.strategy = strategy;
    this.unit = unit;
  }
}
