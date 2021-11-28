import { Cascade, Collection, Entity, OneToMany, QueryOrder } from '@mikro-orm/core';
import { FinRecord } from '@white-rabbit/business-logic';
import AccessibleEntity from './accessible-entity';

@Entity()
class Journal extends AccessibleEntity<Journal> {
  @OneToMany(() => FinRecord, (record) => record.journal, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
    orderBy: { timestamp: QueryOrder.ASC },
  })
  readonly records: Collection<FinRecord>;
}

export default Journal;
