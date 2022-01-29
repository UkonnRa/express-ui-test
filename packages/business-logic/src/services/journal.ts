import { MikroORM } from '@mikro-orm/core';
import { Group, Journal, User } from '../entities';
import { AccessItemGroupCreateOptions, AccessItemUserCreateOptions } from '../entities/access-item';
import { AccessListCreateOptions } from '../entities/access-list';

export type JournalCommandType = 'CreateJournal' | 'UpdateJournal' | 'DeleteJournal';

type AccessItemCreateValue = { type: 'USER'; userId: string } | { type: 'GROUP'; groupId: string };

export abstract class JournalCommand {
  readonly type: JournalCommandType;
}

export class JournalCommandCreate extends JournalCommand {
  override readonly type = 'CreateJournal';

  readonly name: string;

  readonly description: string;

  readonly admins: AccessItemCreateValue[];

  readonly members: AccessItemCreateValue[];
}

export class JournalService {
  constructor(private readonly orm: MikroORM) {}

  private async getAccessList(values: AccessItemCreateValue[]): Promise<AccessListCreateOptions> {
    const userIds = [];
    const groupIds = [];
    for (const v of values) {
      if (v.type === 'USER') {
        userIds.push(v.userId);
      } else {
        groupIds.push(v.groupId);
      }
    }
    const users = await this.orm.em.find(User, { id: { $in: userIds } });
    const userValues = users.map<Omit<AccessItemUserCreateOptions, 'parent'>>((v) => ({ type: 'USER', user: v }));
    const groups = await this.orm.em.find(Group, { id: { $in: groupIds } });
    const groupValues = groups.map<Omit<AccessItemGroupCreateOptions, 'parent'>>((v) => ({ type: 'GROUP', group: v }));
    return { type: 'ITEMS', items: [...userValues, ...groupValues] };
  }

  async createJournal({ name, description, admins, members }: JournalCommandCreate): Promise<string> {
    const adminList = await this.getAccessList(admins);
    const memberList = await this.getAccessList(members);
    const result = new Journal({ name, description, admins: adminList, members: memberList });
    await this.orm.em.persistAndFlush([result]);
    return result.id;
  }
}
