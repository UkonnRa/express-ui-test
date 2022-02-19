import { inject, injectable } from 'tsyringe';
import { AccessItemGroupCreateOptions, AccessItemUserCreateOptions } from './access-item';
import { AccessList, AccessListCreateOptions } from './access-list';
import { UserRepository } from '../user';
import { GroupRepository } from '../group';
import { Journal } from './journal';
import { AccessItemValue, JournalCommandCreate, JournalCommandDelete, JournalCommandUpdate } from './journal-command';
import AuthUser from '../../shared/auth-user';
import { NoAuthError, NoExpectedScopeError, NotFoundError } from '../../shared/errors';
import { JournalRepository } from './index';

@injectable()
export default class JournalService {
  private readonly writeScope = 'journals:write';

  constructor(
    @inject('JournalRepository') private readonly repository: JournalRepository,
    @inject('UserRepository') private readonly userRepository: UserRepository,
    @inject('GroupRepository') private readonly groupRepository: GroupRepository,
  ) {}

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
    const userValues = users.map<Omit<AccessItemUserCreateOptions, 'parent'>>((v) => ({ type: 'USER', user: v }));
    const groups = await this.groupRepository.findByIds(groupIds);
    const groupValues = groups.map<Omit<AccessItemGroupCreateOptions, 'parent'>>((v) => ({ type: 'GROUP', group: v }));
    return { type: 'ITEMS', items: [...userValues, ...groupValues] };
  }

  async createJournal(
    { user, scopes }: AuthUser,
    { name, description, admins, members }: JournalCommandCreate,
  ): Promise<string> {
    if (!scopes.includes(this.writeScope)) {
      throw new NoExpectedScopeError(user, this.writeScope);
    }

    const adminList = await this.getAccessList(admins);
    const memberList = await this.getAccessList(members);
    const result = new Journal({ name, description, admins: adminList, members: memberList });
    await this.repository.save(result);
    return result.id;
  }

  private async getEntityWithAuth({ user, scopes }: AuthUser, id: string): Promise<Journal> {
    if (!scopes.includes(this.writeScope)) {
      throw new NoExpectedScopeError(user, this.writeScope);
    }

    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError('Journal', id);
    }

    if (!entity.isWritable(user)) {
      throw new NoAuthError(user, 'Journal', id);
    }

    return entity;
  }

  async updateJournal(
    authUser: AuthUser,
    { id, name, description, admins, members }: JournalCommandUpdate,
  ): Promise<void> {
    const entity = await this.getEntityWithAuth(authUser, id);

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
      entity.admins = new AccessList(temp);
    }

    if (members) {
      const temp = await this.getAccessList(members);
      entity.members = new AccessList(temp);
    }

    await this.repository.save(entity);
  }

  async deleteJournal(authUser: AuthUser, { id }: JournalCommandDelete): Promise<void> {
    const entity = await this.getEntityWithAuth(authUser, id);

    entity.deleted = true;

    await this.repository.save(entity);
  }
}
