import { Cascade, Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Journal } from '@white-rabbit/business-logic';
import AbstractEntity from './abstract-entity';
import { User } from './user';

export type FinRecordCreateOptions = {
  timestamp: Date;
  user: User;
  journal: Journal;
};

@Entity()
export class FinRecord extends AbstractEntity<FinRecord> {
  @Property()
  readonly timestamp: Date;

  @ManyToOne(() => User, { cascade: [Cascade.ALL] })
  readonly user: User;

  @ManyToOne(() => Journal, { cascade: [Cascade.ALL] })
  readonly journal: Journal;

  constructor({ timestamp, user, journal }: FinRecordCreateOptions) {
    super();
    this.timestamp = timestamp;
    this.user = user;
    this.journal = journal;
  }
}
