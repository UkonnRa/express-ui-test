import { Cascade, Collection, Entity, OneToMany, QueryOrder } from '@mikro-orm/core';
import { FinRecord } from '@white-rabbit/business-logic';
import { AccessibleEntity, AccessibleEntityCreateOptions } from './accessible-entity';
import { FinRecordCreateOptions } from './fin-record';

export type JournalCreateOptions = AccessibleEntityCreateOptions & {
  records?: Omit<FinRecordCreateOptions, 'journal'>[];
};

@Entity()
export class Journal extends AccessibleEntity<Journal> {
  @OneToMany(() => FinRecord, (record) => record.journal, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
    orderBy: { timestamp: QueryOrder.ASC },
  })
  readonly records: Collection<FinRecord>;

  constructor({ name, admins, members, records }: JournalCreateOptions) {
    super({ name, admins, members });
    this.records = new Collection<FinRecord>(
      this,
      records?.map((record) => new FinRecord({ ...record, journal: this })),
    );
  }
}
