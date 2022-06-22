import {
  Cascade,
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property,
  types,
  Unique,
} from "@mikro-orm/core";
import { AbstractEntity } from "../shared";
import { JournalEntity } from "../journal";
import RecordTypeValue from "./record-type.value";
// eslint-disable-next-line import/no-cycle
import RecordItemValue from "./record-item.value";

export const RECORD_TYPE = "record";

export const RECORD_TYPE_PLURAL = "records";

@Entity({ collection: RECORD_TYPE })
@Unique({ properties: ["journal", "name"] })
export default class RecordEntity extends AbstractEntity<RecordEntity> {
  @ManyToOne(() => JournalEntity, {
    onDelete: "cascade",
    onUpdateIntegrity: "cascade",
  })
  journal: JournalEntity;

  @Property({ type: "string" })
  name: string;

  @Property({ type: "string" })
  description: string;

  @Enum({ type: "string", items: () => RecordTypeValue, nullable: true })
  type?: RecordTypeValue;

  @Property({ type: Date })
  timestamp: Date;

  @Property({ type: types.array })
  tags: Set<string> = new Set();

  @OneToMany(() => RecordItemValue, (item) => item.record, {
    orphanRemoval: true,
    eager: true,
    cascade: [Cascade.ALL],
  })
  items = new Collection<RecordItemValue>(this);

  constructor(
    journal: JournalEntity,
    name: string,
    description: string,
    type: RecordTypeValue,
    timestamp: Date,
    tags: Set<string>
  ) {
    super();
    this.journal = journal;
    this.name = name;
    this.description = description;
    this.type = type;
    this.timestamp = timestamp;
    this.tags = tags;
  }
}
