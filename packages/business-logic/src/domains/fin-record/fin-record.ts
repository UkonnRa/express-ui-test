import AbstractEntity from '../../shared/abstract-entity';
import { User } from '../user';
import { Journal } from '../journal';

export type FinRecordCreateOptions = {
  timestamp: Date;
  user: User;
  journal: Journal;
};

export class FinRecord extends AbstractEntity<FinRecord, never> {
  readonly timestamp: Date;

  readonly user: User;

  readonly journal: Journal;

  constructor({ timestamp, user, journal }: FinRecordCreateOptions) {
    super();
    this.timestamp = timestamp;
    this.user = user;
    this.journal = journal;
  }

  isReadable(): boolean {
    return false;
  }

  isWritable(): boolean {
    return false;
  }

  toValue(): never {
    throw new Error('Method not implemented.');
  }
}
