import { MikroORM } from '@mikro-orm/core';
import { injectable } from 'tsyringe';
import { AccessItemGroupCreateOptions, AccessItemUserCreateOptions } from './access-item';
import { AccessListCreateOptions } from './access-list';
import { User } from '../user';
import { Group } from '../group';
import { Journal } from './journal';
import { AccessItemValue, JournalCommandCreate } from './journal-command';
import AuthUser from '../../shared/auth-user';
import { NoExpectedScopeError } from '../../shared/errors';

@injectable()
export default class JournalService {
  constructor(private readonly orm: MikroORM) {}

  private async getAccessList(values: AccessItemValue[]): Promise<AccessListCreateOptions> {
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

  async createJournal(
    { user, scopes }: AuthUser,
    { name, description, admins, members }: JournalCommandCreate,
  ): Promise<string> {
    if (!scopes.includes('journals:write')) {
      throw new NoExpectedScopeError(user, 'journals:write');
    }

    const adminList = await this.getAccessList(admins);
    const memberList = await this.getAccessList(members);
    const result = new Journal({ name, description, admins: adminList, members: memberList });
    await this.orm.em.persistAndFlush([result]);
    return result.id;
  }
}
