import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Journal } from '@white-rabbit/business-logic';
import AbstractEntity from './abstract-entity';
import { User } from './user';

@Entity()
class FinRecord extends AbstractEntity<FinRecord> {
  @Property()
  readonly timestamp: Date;

  @ManyToOne(() => User)
  readonly user: User;

  @ManyToOne(() => Journal)
  readonly journal: Journal;

  constructor(timestamp: Date, user: User, journal: Journal) {
    super();
    this.timestamp = timestamp;
    this.user = user;
    this.journal = journal;
  }
}

export default FinRecord;
