import { inject, singleton } from 'tsyringe';
import { AccessItemGroupCreateOptions, AccessItemUserCreateOptions } from './access-item';
import { AccessList, AccessListCreateOptions } from './access-list';
import { Journal, TYPE } from './journal';
import { JournalCommandCreate, JournalCommandDelete, JournalCommandUpdate } from './journal-command';
import AuthUser from '../../shared/auth-user';
import { AccessItemValue } from './index';
import { JournalValue } from './journal-value';
import AbstractService from '../../shared/abstract-service';
import { JournalQuery } from './journal-query';
import { GroupRepository, JournalRepository, UserRepository } from '../index';

@singleton()
export default class JournalService extends AbstractService<Journal, JournalRepository, JournalValue, JournalQuery> {
  constructor(
    @inject('JournalRepository') protected override readonly repository: JournalRepository,
    @inject('UserRepository') private readonly userRepository: UserRepository,
    @inject('GroupRepository') private readonly groupRepository: GroupRepository,
  ) {
    super(TYPE, 'journals:read', 'journals:write', repository);
  }

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
    const users = await this.userRepository.findByIds(userIds);
    const userValues = [...users].map<Omit<AccessItemUserCreateOptions, 'parent'>>((e) => ({
      type: 'USER',
      user: e[1],
    }));
    const groups = await this.groupRepository.findByIds(groupIds);
    const groupValues = [...groups].map<Omit<AccessItemGroupCreateOptions, 'parent'>>((e) => ({
      type: 'GROUP',
      group: e[1],
    }));
    return { type: 'ITEMS', items: [...userValues, ...groupValues] };
  }

  async createJournal(
    authUser: AuthUser,
    { name, description, admins, members }: JournalCommandCreate,
  ): Promise<string> {
    this.checkScope(authUser);

    const adminList = await this.getAccessList(admins);
    const memberList = await this.getAccessList(members);
    const result = new Journal({ name, description, admins: adminList, members: memberList });
    await this.repository.save(result);
    return result.id;
  }

  async updateJournal(
    authUser: AuthUser,
    { id, name, description, admins, members }: JournalCommandUpdate,
  ): Promise<void> {
    const entity = await this.getEntity(authUser, id);

    if (!name && !description && !admins && !members) {
      return;
    }

    if (name) {
      entity.name = name;
    }

    if (description) {
      entity.description = description;
    }

    if (admins) {
      const temp = await this.getAccessList(admins);
      entity.admins = new AccessList(entity, temp);
    }

    if (members) {
      const temp = await this.getAccessList(members);
      entity.members = new AccessList(entity, temp);
    }

    await this.repository.save(entity);
  }

  async deleteJournal(authUser: AuthUser, { id }: JournalCommandDelete): Promise<void> {
    const entity = await this.getEntity(authUser, id);

    entity.deleted = true;

    await this.repository.save(entity);
  }
}
