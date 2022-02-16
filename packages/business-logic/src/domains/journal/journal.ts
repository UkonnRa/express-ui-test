import { Cascade, Collection, Entity, OneToMany, OneToOne, Property, QueryOrder } from '@mikro-orm/core';
import { FinRecord, FinRecordCreateOptions, Account, AccountCreateOptions } from '../fin-record';
import AbstractEntity from '../../shared/abstract-entity';
import { AccessList, AccessListCreateOptions } from './access-list';

export type JournalCreateOptions = {
  name: string;
  description: string;
  admins: AccessListCreateOptions;
  members: AccessListCreateOptions;
  records?: Omit<FinRecordCreateOptions, 'journal'>[];
  accounts?: Omit<AccountCreateOptions, 'journal'>[];
};

@Entity()
export class Journal extends AbstractEntity<Journal> {
  @Property()
  readonly name: string;

  @Property()
  readonly description: string;

  @OneToOne(() => AccessList)
  readonly admins: AccessList;

  @OneToOne(() => AccessList)
  readonly members: AccessList;

  @OneToMany(() => FinRecord, (record) => record.journal, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
    orderBy: { timestamp: QueryOrder.ASC },
  })
  readonly records: Collection<FinRecord>;

  @OneToMany(() => Account, (account) => account.journal, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
    orderBy: { createdAt: QueryOrder.ASC },
  })
  readonly accounts: Collection<Account>;

  constructor({ name, description, admins, members, records, accounts }: JournalCreateOptions) {
    super();
    this.name = name;
    this.description = description;
    this.admins = new AccessList(admins);
    this.members = new AccessList(members);
    this.records = new Collection<FinRecord>(
      this,
      records?.map((record) => new FinRecord({ ...record, journal: this })),
    );
    this.accounts = new Collection<Account>(
      this,
      accounts?.map((account) => new Account({ ...account, journal: this })),
    );
  }
}
